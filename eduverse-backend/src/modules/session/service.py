from sqlalchemy.orm import Session
from src.db.schema.models import Session as SessionModel, Learner
from src.core.types.requests import SessionStartRequest
from src.modules.interaction.service import get_session_state

def start_session(db: Session, request: SessionStartRequest) -> SessionModel:
    learner = db.query(Learner).filter(Learner.external_id == request.learner_id).first()
    if not learner:
        learner = Learner(external_id=request.learner_id)
        db.add(learner)
        db.commit()
        db.refresh(learner)
        
    session_entry = SessionModel(
        learner_id=learner.id,
        topic_id=request.topic_id,
        ab_group=request.ab_group
    )
    db.add(session_entry)
    db.commit()
    db.refresh(session_entry)

    # Initialize in-memory state with strategy mode
    state = get_session_state(session_entry.id)
    state.strategy_mode = request.strategy_mode or "balanced"

    return session_entry
