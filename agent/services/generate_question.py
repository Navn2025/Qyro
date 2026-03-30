from state.state import State
from models.questions import QuestionSet
from langchain_core.messages import HumanMessage, SystemMessage
from prompts.question_generation_prompt import SYSTEM_PROMPT, USER_PROMPT
from langchain_google_genai import ChatGoogleGenerativeAI

def generate_question(state: State):
    print(f"Generating questions for run_id {state.get('run_id', 'unknown')}...")

    api_key = state.get("api_keys", {}).get("gemini", "")
    llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite-preview", api_key=api_key)
    llm_set = llm.with_structured_output(QuestionSet)

    result = llm_set.invoke(
        [
            SystemMessage(content=SYSTEM_PROMPT.format(N=state["N"])),
            HumanMessage(
                content=USER_PROMPT.format(
                    subject=state["subject"],
                    subject_description=state.get("subject_description", "N/A"),
                    difficulty=state["difficulty"],
                    mode="single_bloom" if state.get("bloom_level") else "mixed_bloom",
                    bloom_level=state.get("bloom_level", "mixed"),
                    true_or_false="true",
                    N=state["N"],
                    run_id=state.get("run_id", 0),
                )
            ),
        ]
    )

    for i, q in enumerate(result.questions):
        q.id = i + 1

    return {"questions": result.questions, "duplicate_results": []}
