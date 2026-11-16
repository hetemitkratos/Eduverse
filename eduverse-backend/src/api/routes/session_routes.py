from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.db.database import get_db
from src.core.types.requests import SessionStartRequest, SessionResponse
from src.modules.session.service import start_session

router = APIRouter(prefix="/api/session", tags=["Session"])

@router.post("/start", response_model=SessionResponse)
def create_session(request: SessionStartRequest, db: Session = Depends(get_db)):
    session_entry = start_session(db, request)
    return SessionResponse(
        session_id=session_entry.id,
        learner_id=request.learner_id,
        topic_id=request.topic_id,
        ab_group=request.ab_group or "A",
    )
