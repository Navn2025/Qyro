

from state.state import State


from langgraph.types import Send
def fan_out_duplicate_check(state: State):
    """Fan out one check_duplicates task per question (parallel)."""
    return [
        Send(
            "check_duplicates",
            {
                "question": q,
                "subject": state["subject"],
                "difficulty": state["difficulty"],
            }
        )
        for q in state["questions"]
    ]