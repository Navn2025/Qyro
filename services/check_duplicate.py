from state.state import State
from models.questions import QuestionExists
from services.vector_store import get_vector_store
from services.embeddings import get_embeddings
from langchain_core.messages import HumanMessage, SystemMessage
from prompts.duplicate_check_prompt import CHECK_PROMPT

from sklearn.metrics.pairwise import cosine_similarity
SIM_THRESHOLD = 0.85

def check_duplicates(state: State):
    q = state["question"]
    print(f"Checking duplicate for QID {q.id}...")
    
    # ─────────────────────────────
    # Step 0: Initialize dynamic services
    # ─────────────────────────────
    hf_token = state.get("api_keys", {}).get("hf", "")
    vector_store = get_vector_store(hf_token)
    embeddings = get_embeddings(hf_token)

    # ─────────────────────────────
    # Step 1: vector search
    # ─────────────────────────────
    results = vector_store.similarity_search(
        q.question_text,
        k=1,
        filter={"subject": state["subject"]}
    )

    # No match → unique
    if not results:
        return {
            "duplicate_results": [{
                "question_id": q.id,
                "question": q,
                "result": QuestionExists(exists=False)
            }]
        }

    matched_q = results[0].page_content

    # ─────────────────────────────
    # Step 2: embedding similarity
    # ─────────────────────────────
    emb1 = embeddings.embed_query(q.question_text)
    emb2 = embeddings.embed_query(matched_q)

    score = float(cosine_similarity([emb1], [emb2])[0][0])

    # ✅ Strong unique → skip LLM
    if score < 0.6:
        return {
            "duplicate_results": [{
                "run_id": state.get("run_id"),
                "question_id": q.id,
                "question": q,
                "result": QuestionExists(exists=False)
            }]
        }

    # ✅ Strong duplicate → skip LLM
    if score > 0.9:
        return {
            "duplicate_results": [{
                "run_id": state.get("run_id"),
                "question_id": q.id,
                "question": q,
                "result": QuestionExists(exists=True)
            }]
        }

    # ─────────────────────────────
    # Step 3: LLM validation (ONLY borderline)
    # ─────────────────────────────
    from langchain_groq import ChatGroq
    run_id = state.get("run_id", 0) or 0
    api_keys = state.get("api_keys", {})
    # Alternate Groq keys: even run_ids → groq, odd → groq_2
    groq_key = api_keys.get("groq_2", "") if run_id % 2 != 0 else api_keys.get("groq", "")
    if not groq_key:
        groq_key = api_keys.get("groq", "")
    llm_basic = ChatGroq(model='llama-3.1-8b-instant', api_key=groq_key)
    llm_structured = llm_basic.with_structured_output(QuestionExists)

    prompt = CHECK_PROMPT.format(
        new_question=q.question_text,
        matched_question=matched_q
    )

    try:
        eval_result = llm_structured.invoke([
            HumanMessage(content=prompt)
        ])

        # 🔒 Safety fallback
        if eval_result.exists not in [True, False]:
            raise ValueError("Invalid exists value")

    except Exception as e:
        print(f"⚠️ [Duplicate Check] LLM failed (Run ID: {state.get('run_id')}), falling back to semantic similarity score...")
        print(f"   Similarity Score: {score:.4f} | Threshold: {SIM_THRESHOLD}")
        eval_result = QuestionExists(
            exists=score >= SIM_THRESHOLD
        )
        print(f"   Fallback Result: {'DUPLICATE' if eval_result.exists else 'UNIQUE'}")

    return {
        "duplicate_results": [{
            "question_id": q.id,
            "run_id": state.get("run_id"),
            "question": q,
            "result": eval_result
        }]
    }