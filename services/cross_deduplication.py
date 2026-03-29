from state.state import State
from services.embeddings import get_embeddings

INTRA_BATCH_SIM_THRESHOLD = 0.82  # tune: lower = stricter dedup

def cross_batch_deduplicate(state: State) -> dict:
    """
    Runs AFTER fan-in. Checks all questions in the batch against EACH OTHER.
    This is the missing complement to check_duplicates (which only checks vs DB).
    """
    questions = state["questions"]

    if len(questions) < 2:
        return {}  # nothing to compare

    print(f"Cross-batch dedup: checking {len(questions)} questions against each other...")

    # ── Step 1: Embed all questions in one pass ────────────────────────────
    hf_token = state.get("api_keys", {}).get("hf", "")
    embeddings = get_embeddings(hf_token)
    
    from sklearn.metrics.pairwise import cosine_similarity
    emb_list = [embeddings.embed_query(q.question_text) for q in questions]
    sim_matrix = cosine_similarity(emb_list)   # shape (N, N)

    # ── Step 2: Greedy dedup — keep first, drop similar later ones ─────────
    keep = [True] * len(questions)

    for i in range(len(questions)):
        if not keep[i]:
            continue
        for j in range(i + 1, len(questions)):
            if not keep[j]:
                continue
            score = sim_matrix[i][j]
            if score >= INTRA_BATCH_SIM_THRESHOLD:
                print(f"  ⚠️  Q{questions[i].id} ↔ Q{questions[j].id} | sim={score:.3f} → dropping Q{questions[j].id}")
                keep[j] = False   # drop the later duplicate

    unique_questions = [q for q, k in zip(questions, keep) if k]
    dropped = len(questions) - len(unique_questions)

    # Always re-number IDs sequentially across all combined parallel workflows
    for idx, q in enumerate(unique_questions):
        q.id = idx + 1

    if dropped == 0:
        print("  ✅ No intra-batch duplicates found.")
        return {"questions": unique_questions}

    print(f"  Dropped {dropped} intra-batch duplicate(s). Continuing with {len(unique_questions)} questions.")

    return {
        "questions":    unique_questions,
        "evaluation":   [],           # reset so check_quality re-evaluates
        "duplicate_results": [],
    }