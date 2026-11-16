from pydantic import BaseModel
from typing import Optional

class SessionStartRequest(BaseModel):
    learner_id: str
    topic_id: str
    ab_group: Optional[str] = "A"
    strategy_mode: Optional[str] = "balanced"

class SessionResponse(BaseModel):
    session_id: int
    learner_id: str
    topic_id: str
    ab_group: str

class InteractionRequest(BaseModel):
    session_id: int
    event_type: str
    event_value: float

class QuizSubmitRequest(BaseModel):
    answers: list[str]

class QuizSubmitResponse(BaseModel):
    score: float
    difficulty_next: str
    feedback: str
