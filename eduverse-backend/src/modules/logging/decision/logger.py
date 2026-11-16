from sqlalchemy.orm import Session
from src.db.schema.models import DecisionLog

def log_adaptation_decision(db: Session, session_id: int, agent: str, action: str, confidence: float):
    entry = DecisionLog(
        session_id=session_id,
        agent=agent,
        proposed_action=action,
        confidence=confidence,
        final_decision=action
    )
    db.add(entry)
    db.commit()
    return entry
