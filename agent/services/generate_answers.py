from state.state import State
from models.answers import AnswerSet
from langchain_core.messages import HumanMessage, SystemMessage
from prompts.answer_generation_prompt import ANSWER_GENERATION_SYSTEM_PROMPT, ANSWER_GENERATION_USER_PROMPT
from langchain_google_genai import ChatGoogleGenerativeAI

_QUESTION_TEMPLATE = """
---
Question ID : {id}
Question    : {question_text}
Difficulty  : {difficulty}
Bloom Level : {bloom_level}
Topic Tags  : {topic_tags}
---
""".strip()

def generate_answer(state: State) -> dict:
    print(f"Generating answers — answer_iteration={state.get('answer_iteration', 0) + 1}")
    questions = state["questions"]

    # Use the SECONDARY Gemini key for answer generation
    api_key = state.get("api_keys", {}).get("gemini_2", "") or state.get("api_keys", {}).get("gemini", "")
    llm_ans = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite-preview", api_key=api_key)
    llm_struct = llm_ans.with_structured_output(AnswerSet)

    questions_block = "\n\n".join(
        _QUESTION_TEMPLATE.format(
            id=q.id,
            question_text=q.question_text,
            difficulty=q.difficulty,
            bloom_level=q.bloom_level,
            topic_tags=", ".join(q.topic_tags or []),
        )
        for q in questions
    )

    messages = [
        SystemMessage(content=ANSWER_GENERATION_SYSTEM_PROMPT),
        HumanMessage(content=ANSWER_GENERATION_USER_PROMPT.format(
            questions_block=questions_block,
            N=len(questions),
        ))
    ]

    return {
        "answer": llm_struct.invoke(messages),
    }
