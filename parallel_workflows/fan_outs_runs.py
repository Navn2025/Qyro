
from state.state import State
from langgraph.types import Send



def fan_out_runs(state: State):
    workflows_count = state.get("parallel_workflows", 5)
    return [
        Send("generate_question", {
            **state,
            "run_id": i
        })
        for i in range(workflows_count)
    ]