
from langgraph.graph import StateGraph, START, END
from state.state import State
from services.cross_deduplication import cross_batch_deduplicate
from services.create_memory import create_memory
from fan_in.start_router import start_router
from services.generate_question import generate_question
from services.check_duplicate import check_duplicates
from fan_in.after_duplicate_check import after_duplicate_check
from services.generate_answers import generate_answer
from parallel_workflows.fan_out_duplicate_check import fan_out_duplicate_check
from parallel_workflows.fan_outs_runs import fan_out_runs



builder = StateGraph(State)

# ── Nodes ─────────────────────────────
builder.add_node("start_router", start_router)
builder.add_node("generate_question", generate_question)
builder.add_node("check_duplicates", check_duplicates)
builder.add_node("after_duplicate_check", after_duplicate_check)
builder.add_node("generate_answer", generate_answer)

builder.add_node("cross_batch_deduplicate", cross_batch_deduplicate)  # ✅ FINAL MERGE
builder.add_node("create_memory", create_memory)

# ── START → fan-out ───────────────────
builder.add_edge(START, "start_router")

builder.add_conditional_edges(
    "start_router",
    fan_out_runs,
    ["generate_question"]
)

# ── Per-run pipeline ──────────────────
builder.add_conditional_edges(
    "generate_question",
    fan_out_duplicate_check,
    ["check_duplicates"]
)

builder.add_edge("check_duplicates", "after_duplicate_check")
builder.add_edge("after_duplicate_check", "generate_answer")

# 🔥 CRITICAL FIX
builder.add_edge("generate_answer", "cross_batch_deduplicate")

# 🔥 FINAL SAVE (runs once)
builder.add_edge("cross_batch_deduplicate", "create_memory")

builder.add_edge("create_memory", END)

graph = builder.compile()
