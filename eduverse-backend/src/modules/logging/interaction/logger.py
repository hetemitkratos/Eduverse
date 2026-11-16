from sqlalchemy.orm import Session
from src.db.schema.models import InteractionLog

def log_interaction_event(db: Session, session_id: int, event_type: str, event_value: float):
    entry = InteractionLog(session_id=session_id, event_type=event_type, event_value=event_value)
    db.add(entry)
    db.commit()
    return entry
