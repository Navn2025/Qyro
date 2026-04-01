from typing import List, TypedDict, Optional, Annotated, Literal
from operator import add

from models.questions import Question
from models.answers import Answer, AnswerSet
class State(TypedDict):
    subject: str
    difficulty: str
    bloom_level: Optional[str]
    subject_description: Optional[str]
    N: int
    parallel_workflows: int
    api_keys: dict

    # 🔥 FIX HERE
    questions: Annotated[List[Question], add]

    duplicate_results: Annotated[List[dict], add]

    answers: Annotated[List[Answer], add]
    answer: Optional[AnswerSet]
    # real_world_application:Optional[bool,default=False]

    iteration: int
    count: int

    run_id: Optional[int]
    question: Optional[Question]