from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.db.database import get_db
from src.modules.evaluation.worker import process_session_evaluation
from src.db.schema.models import EvaluationLog, Session as SessionModel

router = APIRouter(prefix="/api/session", tags=["Evaluation"])

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    """Simple Research Dashboard Analytics"""
    session_count = db.query(SessionModel).count()
    
    avg_engagement = db.query(func.avg(EvaluationLog.engagement_score)).scalar() or 0.0
    avg_success = db.query(func.avg(EvaluationLog.adaptation_success)).scalar() or 0.0
    
    # 4.3 A/B test splits
    group_a = db.query(SessionModel).filter(SessionModel.ab_group == "A").count()
    group_b = db.query(SessionModel).filter(SessionModel.ab_group == "B").count()
    
    return {
        "metrics": {
            "total_sessions": session_count,
            "avg_engagement": round(avg_engagement, 2),
            "overall_success_rate": round(avg_success, 4),
            "ab_split": {
                "A": group_a,
                "B": group_b
            }
        }
    }

@router.post("/{session_id}/evaluate_async")
def trigger_evaluation(session_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    background_tasks.add_task(process_session_evaluation, db, session_id)
    return {"status": "Evaluation queued in background"}

@router.get("/{session_id}/report")
def get_report(session_id: int, db: Session = Depends(get_db)):
    log = db.query(EvaluationLog).filter(EvaluationLog.session_id == session_id).order_by(EvaluationLog.timestamp.desc()).first()
    if not log:
        return {"error": "No evaluation report found yet"}
    
    return {
        "session_id": log.session_id,
        "engagement_score": log.engagement_score,
        "completion_rate": log.completion_rate,
        "adaptation_success": log.adaptation_success,
        "quiz_score": log.quiz_score,
        "learning_effectiveness": log.learning_effectiveness,
        "timestamp": log.timestamp
    }
