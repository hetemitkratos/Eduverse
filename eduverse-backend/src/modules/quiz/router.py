from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.db.database import get_db
from src.core.types.requests import QuizSubmitRequest, QuizSubmitResponse
from src.modules.quiz.service import fetch_quiz, fetch_quiz_by_topic, evaluate_and_submit_quiz

router = APIRouter(prefix="/api/session/{session_id}/quiz", tags=["Quiz"])
public_router = APIRouter(prefix="/api", tags=["Quiz"])


@public_router.get("/quiz")
def get_quiz_by_topic(topic: str, db: Session = Depends(get_db)):
    """Returns quiz questions for a topic using seeded DB rows or dataset fallback."""
    return fetch_quiz_by_topic(topic, db)

@router.get("/")
def get_quiz(session_id: int, db: Session = Depends(get_db)):
    """Returns the quiz content filtered purely for the current state difficulty."""
    return fetch_quiz(session_id, db)

@router.post("/submit", response_model=QuizSubmitResponse)
def submit_quiz(session_id: int, request: QuizSubmitRequest, db: Session = Depends(get_db)):
    """Deterministically evaluates answers against dataset, applying new difficulty thresholds."""
    return evaluate_and_submit_quiz(session_id, request.answers, db)
