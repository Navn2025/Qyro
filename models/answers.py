from pydantic import BaseModel, Field 
from typing import List
class Answer(BaseModel):
    question_id: int = Field(..., description="ID matching the source Question")
    answer_text: str = Field(
        ..., description="Full structured plain-text answer. "
                         "Sections: Direct Answer | Explanation | Real-World Example | Trade-offs & Edge Cases"
    )
    key_points: List[str] = Field(
        ..., description="3-6 standalone, non-obvious, complete-sentence insights"
    )
    difficulty_alignment: str = Field(
        ..., description="ALIGNED | UNDER-CALIBRATED | OVER-CALIBRATED + one justification sentence"
    )
    bloom_level_alignment: str = Field(
        ..., description="ALIGNED | MISMATCH + one justification sentence"
    )


class AnswerSet(BaseModel):
    answers: List[Answer] = Field(
        ..., description="One Answer object per question. Must match all question IDs."
    )