from state.state import State
from models.answers import Answer, AnswerSet
from langchain_core.messages import HumanMessage, SystemMessage
from prompts.answer_generation_prompt import ANSWER_GENERATION_SYSTEM_PROMPT, ANSWER_GENERATION_USER_PROMPT
from langchain_google_genai import ChatGoogleGenerativeAI
import json
import re

_QUESTION_TEMPLATE = """
---
Question ID : {id}
Question    : {question_text}
Difficulty  : {difficulty}
Bloom Level : {bloom_level}
Topic Tags  : {topic_tags}
---
""".strip()


def _extract_text(raw_obj) -> str:
    if raw_obj is None:
        return ""

    content = getattr(raw_obj, "content", raw_obj)
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts: list[str] = []
        for part in content:
            if isinstance(part, dict):
                text = part.get("text") or part.get("output_text") or ""
                if text:
                    parts.append(str(text))
            elif isinstance(part, str):
                parts.append(part)
            else:
                parts.append(str(part))
        return "\n".join([p for p in parts if p])

    return str(content)


def _strip_fences(text: str) -> str:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def _validate_answer_set(payload) -> AnswerSet:
    if hasattr(AnswerSet, "model_validate"):
        return AnswerSet.model_validate(payload)
    return AnswerSet.parse_obj(payload)


def _validate_answer(payload) -> Answer:
    if hasattr(Answer, "model_validate"):
        return Answer.model_validate(payload)
    return Answer.parse_obj(payload)


def _parse_answer_from_text(raw_text: str, question_id: int) -> Answer:
    cleaned = _strip_fences(raw_text)

    try:
        payload = json.loads(cleaned)
    except Exception:
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if not match:
            raise ValueError("No JSON object found in raw model output")
        payload = json.loads(match.group(0))

    answer = None
    if isinstance(payload, dict) and "answers" in payload:
        parsed = _validate_answer_set(payload)
        answer = next(
            (a for a in parsed.answers if a.question_id == question_id),
            parsed.answers[0] if parsed.answers else None,
        )
    else:
        answer = _validate_answer(payload)

    if answer is None:
        raise ValueError("Parsed payload did not contain a valid answer")

    answer.question_id = question_id
    return answer

def generate_answer(state: State) -> dict:
    print(f"Generating answers — answer_iteration={state.get('answer_iteration', 0) + 1}")
    questions = state["questions"]

    # Use the SECONDARY Gemini key for answer generation
    api_key = state.get("api_keys", {}).get("gemini_2", "") or state.get("api_keys", {}).get("gemini", "")
    llm_ans = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite-preview", api_key=api_key)
    llm_struct = llm_ans.with_structured_output(AnswerSet, include_raw=True)
    generated_answers: list[Answer] = []

    # Per-question generation avoids large response truncation in bigger batches.
    for q in questions:
        questions_block = _QUESTION_TEMPLATE.format(
            id=q.id,
            question_text=q.question_text,
            difficulty=q.difficulty,
            bloom_level=q.bloom_level,
            topic_tags=", ".join(q.topic_tags or []),
        )

        messages = [
            SystemMessage(content=ANSWER_GENERATION_SYSTEM_PROMPT),
            HumanMessage(content=ANSWER_GENERATION_USER_PROMPT.format(
                questions_block=questions_block,
                N=1,
            ))
        ]

        try:
            result = llm_struct.invoke(messages)

            parsed_set = result.get("parsed") if isinstance(result, dict) else None
            answer = None

            if parsed_set:
                answer = next(
                    (a for a in parsed_set.answers if a.question_id == q.id),
                    parsed_set.answers[0] if parsed_set.answers else None,
                )

            if answer is None:
                raw_text = _extract_text(result.get("raw") if isinstance(result, dict) else None)
                if raw_text:
                    answer = _parse_answer_from_text(raw_text, q.id)

            if answer is None:
                strict_messages = [
                    SystemMessage(
                        content=ANSWER_GENERATION_SYSTEM_PROMPT
                        + "\nReturn ONLY valid JSON. Do not wrap output in markdown code fences."
                    ),
                    HumanMessage(
                        content=(
                            ANSWER_GENERATION_USER_PROMPT.format(questions_block=questions_block, N=1)
                            + "\nReturn exactly this JSON shape: "
                            + '{"answers": [{"question_id": <int>, "answer_text": <string>, '
                            + '"key_points": [<string>, ...], "difficulty_alignment": <string>, '
                            + '"bloom_level_alignment": <string>}]}.'
                        )
                    ),
                ]
                retry_result = llm_struct.invoke(strict_messages)
                retry_set = retry_result.get("parsed") if isinstance(retry_result, dict) else None
                if retry_set:
                    answer = next(
                        (a for a in retry_set.answers if a.question_id == q.id),
                        retry_set.answers[0] if retry_set.answers else None,
                    )
                if answer is None:
                    retry_raw_text = _extract_text(retry_result.get("raw") if isinstance(retry_result, dict) else None)
                    if retry_raw_text:
                        answer = _parse_answer_from_text(retry_raw_text, q.id)

            if answer is None:
                raise ValueError("No answers returned")

            answer.question_id = q.id
            generated_answers.append(answer)
        except Exception as e:
            print(f"⚠️ Answer generation failed for QID {q.id}: {e}")
            generated_answers.append(
                Answer(
                    question_id=q.id,
                    answer_text="Answer generation failed for this question.",
                    key_points=["Model response could not be parsed into the expected schema."],
                    difficulty_alignment="UNDER-CALIBRATED. Could not evaluate due to generation failure.",
                    bloom_level_alignment="MISMATCH. Could not evaluate due to generation failure.",
                )
            )

    return {
        "answers": generated_answers,
        "answer": AnswerSet(answers=generated_answers),
    }
