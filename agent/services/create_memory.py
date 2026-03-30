from typing import cast
from state.state import State

from db.db import Session as DefaultSession
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.models import Base, QATable
from services.vector_store import get_vector_store
import uuid
def create_memory(state: State) -> dict:
    """Persist only NON-duplicate Q&A pairs to PostgreSQL + Vector DB."""

    # ─────────────────────────────
    # 🔥 Build duplicate map (global mapping)
    # ─────────────────────────────
    dup_map = {
        item["question_id"]: item["result"]
        for item in state.get("duplicate_results", [])
    }

    # ─────────────────────────────
    # ✅ Filter ONLY non-duplicates
    # ─────────────────────────────
    questions = [
        q for q in state["questions"]
        if not dup_map.get(q.id) or not dup_map[q.id].exists
    ]

    answer_obj = state.get("answer")
    answers = answer_obj.answers if answer_obj else []
    answer_map = {a.question_id: a for a in answers}

    db_uri = state.get("api_keys", {}).get("db_uri", "")
    if db_uri and db_uri.strip():
        try:
            print(f"Connecting to USER's private database: {db_uri}")
            temp_engine = create_engine(db_uri, pool_pre_ping=True)
            # Pre-initialize schema in user's DB for compatibility
            Base.metadata.create_all(bind=temp_engine)
            session = sessionmaker(bind=temp_engine)()
        except Exception as e:
            print(f"⚠️ Failed to connect to private DB URI, falling back to Primary DB: {e}")
            session = DefaultSession()
    else:
        print("Using Primary Database (no private DB URI specified).")
        session = DefaultSession()

    saved: int = 0

    texts = []
    metadatas = []

    for q in questions:
        print(f"Saving QID {q.id}...")

        qa_id = f"{state['subject']}_{state['difficulty']}_{uuid.uuid4().hex}"

        ans = answer_map.get(q.id)
        q_text = q.question_text
        a_text = ans.answer_text if ans else "No answer"
        topic_tags = q.topic_tags or []

        embed_text = f"Question: {q_text}\nAnswer: {a_text}"

        # ─────────────────────────────
        # 🛡️ DB duplicate safety
        # ─────────────────────────────
        try:
            existing = session.query(QATable).filter(
                QATable.question_text.ilike(f"%{q_text[:50]}%")
            ).first()

            if existing:
                print(f"  Skipping QID {q.id} — DB duplicate")
                continue

            # ─────────────────────────────
            # ✅ Save to PostgreSQL
            # ─────────────────────────────
            session.add(QATable(
                question_id=qa_id,
                question_text=q_text,
                answer_text=a_text,
                subject=state["subject"],
                difficulty=state["difficulty"],
                bloom_level=state.get("bloom_level") or "mixed",
                topic_tags=topic_tags,
            ))

            # ─────────────────────────────
            # ✅ Prepare vector DB batch
            # ─────────────────────────────
            texts.append(embed_text)
            metadatas.append({
                "question_id": qa_id,
                "question_text": q_text,
                "answer_text": a_text,
                "subject": state["subject"],
                "difficulty": state["difficulty"],
                "bloom_level": state.get("bloom_level") or "mixed",
                "topic_tags": topic_tags,
            })

            saved = cast(int, saved) + 1

        except Exception as e:
            session.rollback()
            print(f"  DB Error for QID {q.id}: {e}")

    # ─────────────────────────────
    # 🚀 Batch insert into Vector DB
    # ─────────────────────────────
    if texts:
        hf_token = state.get("api_keys", {}).get("hf", "")
        vector_store = get_vector_store(hf_token)
        vector_store.add_texts(
            texts=texts,
            metadatas=metadatas
        )

    session.commit()
    session.close()

    print(f"Saved {saved} new Q&A pairs.")

    return {"count": state.get("count", 0) + saved}