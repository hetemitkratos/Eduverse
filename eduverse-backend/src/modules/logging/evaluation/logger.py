from sqlalchemy.orm import Session
from src.db.schema.models import EvaluationLog

def log_evaluation_report(db: Session, session_id: int, engagement_score: float, completion_rate: float, success: float, quiz_score: float = 0.0, effectiveness: float = 0.0):
    entry = EvaluationLog(
        session_id=session_id,
        engagement_score=engagement_score,
        completion_rate=completion_rate,
        adaptation_success=success,
        quiz_score=quiz_score,
        learning_effectiveness=effectiveness
    )
    db.add(entry)
    db.commit()
    return entry
