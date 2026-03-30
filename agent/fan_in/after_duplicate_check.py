from state.state import State
def after_duplicate_check(state: State):
    """Fan-in barrier: waits for all check_duplicates tasks to merge."""
    return {}