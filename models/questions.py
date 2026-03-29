
from pydantic import BaseModel, Field 
from typing import List
class Question(BaseModel):
    id: int
    question_text: str
    bloom_level: str
    difficulty: str
    topic_tags: List[str]
    estimated_answer_time_sec: int


class QuestionSet(BaseModel):
    questions: List[Question]

class QuestionExists(BaseModel):
    exists: bool