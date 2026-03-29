from fastapi import APIRouter, HTTPException, status
from schemas.initial_state import InitialState
from fastapi.responses import StreamingResponse
import json

# import your graph
from graph.graph import graph  # ⚠️ change this

from fastapi import Request, Depends
import time
from db.db import Session as DbSession
from models.models import UserSettings

LAST_COMPLETED_TIME = {}

router = APIRouter(
    prefix="/v1/generate",
    tags=["generate"],
)


@router.post("/stream")
def generate_stream(state: InitialState, request: Request):
    client_ip = request.client.host
    if client_ip in LAST_COMPLETED_TIME:
        elapsed = time.time() - LAST_COMPLETED_TIME[client_ip]
        if elapsed < 120:
            raise HTTPException(
                status_code=429,
                detail=f"Please wait {int(120 - elapsed)} seconds before your next request.",
            )

    def event_stream():
        try:
            input_state = state.model_dump()

            # Retrieve dynamic API keys — ALL must come from user settings (no .env fallback)
            # Pinecone is the only service that still reads from .env
            db_session = DbSession()
            try:
                settings = None
                if state.user_id:
                    settings = db_session.query(UserSettings).filter(UserSettings.user_id == state.user_id).first()
                
                if not settings or not settings.gemini_api_key or not settings.groq_api_key:
                    raise ValueError(
                        "API keys are not configured. Please open Settings (⚙) and save your Gemini and Groq API keys before generating."
                    )

                input_state["api_keys"] = {
                    "gemini":   settings.gemini_api_key or "",
                    "gemini_2": settings.gemini_api_key_2 or settings.gemini_api_key or "",
                    "groq":     settings.groq_api_key or "",
                    "groq_2":   settings.groq_api_key_2 or settings.groq_api_key or "",
                    "hf":       settings.huggingfacehub_api_token or "",
                    "db_uri":   settings.database_uri or "",
                }
            finally:
                db_session.close()

            yield json.dumps({"step": "started"}) + "\n"

            final_questions = []
            final_answers = []
            duplicate_results = []

            for chunk in graph.stream(input_state):
                # track the pieces for frontend defensively
                gen_q = chunk.get("generate_question")
                if gen_q and isinstance(gen_q, dict) and "questions" in gen_q:
                    q_list = gen_q["questions"]
                    if q_list:
                        final_questions.extend(q_list)

                check_d = chunk.get("check_duplicates")
                if (
                    check_d
                    and isinstance(check_d, dict)
                    and "duplicate_results" in check_d
                ):
                    d_list = check_d["duplicate_results"]
                    if d_list:
                        duplicate_results.extend(d_list)

                cross_d = chunk.get("cross_batch_deduplicate")
                if cross_d and isinstance(cross_d, dict) and "questions" in cross_d:
                    final_questions = cross_d["questions"]

                gen_a = chunk.get("generate_answer")
                if gen_a and isinstance(gen_a, dict) and "answer" in gen_a:
                    ans_obj = gen_a["answer"]
                    final_answers = ans_obj.answers if ans_obj else []

                yield json.dumps({"step": "progress", "data": str(chunk)}) + "\n"

            # Apply identical deduplication logic as create_memory
            dup_map = {
                item["question_id"]: item["result"] for item in duplicate_results
            }

            filtered_questions = [
                q
                for q in final_questions
                if not dup_map.get(q.id)
                or not getattr(dup_map.get(q.id), "exists", False)
            ]

            # Construct final array with sequential IDs (1, 2, 3...)
            result_list = []
            ans_map = {a.question_id: a for a in final_answers}
            for idx, q in enumerate(filtered_questions, start=1):
                ans = ans_map.get(q.id)
                result_list.append(
                    {
                        "id": idx,
                        "question_text": getattr(q, "question_text", ""),
                        "difficulty": getattr(q, "difficulty", state.difficulty),
                        "bloom_level": getattr(q, "bloom_level", state.bloom_level),
                        "topic_tags": getattr(q, "topic_tags", []),
                        "options": getattr(q, "options", {}),
                        "correct_option": getattr(q, "correct_option", ""),
                        "answer": getattr(ans, "answer_text", "No answer generated."),
                    }
                )

            if result_list:
                yield json.dumps({"step": "result", "result": result_list}) + "\n"

            # Update rate-limiting tracker
            LAST_COMPLETED_TIME[client_ip] = time.time()

            yield json.dumps({"step": "completed"}) + "\n"

        except Exception as e:
            yield json.dumps({"step": "error", "message": str(e)}) + "\n"

    return StreamingResponse(event_stream(), media_type="text/plain")
