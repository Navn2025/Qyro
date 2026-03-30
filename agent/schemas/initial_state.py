from pydantic import BaseModel
from typing import Optional,Dict

class InitialState(BaseModel):
    user_id: Optional[str] = None
    subject: str
    subject_description: Optional[str] = None
    difficulty: str
    bloom_level: Optional[str] = None
    N: int
    parallel_workflows: int = 5
    count: int = 0
