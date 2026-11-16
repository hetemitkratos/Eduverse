from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi.responses import StreamingResponse
import io
import csv
from src.db.database import get_db
from src.db.schema.models import Session as SessionModel, EvaluationLog, DecisionLog, ActionMetrics, InteractionLog

router = APIRouter(prefix="/api", tags=["Dashboard"])

@router.get("/dashboard/overview")
def get_global_metrics(db: Session = Depends(get_db)):
    """Computes and aggregates global overarching EduVerse metrics"""
    total_sessions = db.query(SessionModel).count()
    active_sessions = db.query(SessionModel).filter(SessionModel.end_time == None).count()
    
    avg_engagement = db.query(func.avg(EvaluationLog.engagement_score)).scalar() or 0.0
    avg_quiz = db.query(func.avg(EvaluationLog.quiz_score)).scalar() or 0.0
    
    successful = db.query(EvaluationLog).filter(EvaluationLog.adaptation_success > 0).count()
    total_evals = db.query(EvaluationLog).count()
    success_rate = (successful / total_evals) if total_evals > 0 else 0.0

    # 13. Optimized Polling Tracker bounds natively checking absolute DB commit limits
    last_session = db.query(SessionModel).order_by(SessionModel.start_time.desc()).first()
    last_eval = db.query(EvaluationLog).order_by(EvaluationLog.timestamp.desc()).first()
    last_ts = None
    if last_session and last_eval:
        last_ts = max(last_session.start_time, last_eval.timestamp)
    elif last_session:
        last_ts = last_session.start_time
    elif last_eval:
        last_ts = last_eval.timestamp
        
    global_last_updated = last_ts.isoformat() if last_ts else None
    
    return {
        "last_updated": global_last_updated,
        "total_sessions": total_sessions,
        "active_sessions": active_sessions,
        "avg_engagement_score": round(avg_engagement, 2),
        "avg_quiz_score": round(avg_quiz, 2),
        "adaptation_success_rate": round(success_rate, 2)
    }

@router.get("/session/{session_id}/dashboard")
def get_session_metrics(session_id: int, db: Session = Depends(get_db)):
    """Yields deep session-level telemetry and decision timeline"""
    eval_log = db.query(EvaluationLog).filter(EvaluationLog.session_id == session_id).order_by(EvaluationLog.timestamp.desc()).first()
    decisions = db.query(DecisionLog).filter(DecisionLog.session_id == session_id).order_by(DecisionLog.timestamp.asc()).all()
    
    timeline = []
    for d in decisions:
        timeline.append({
            "decision": d.final_decision,
            "agent": d.agent,
            "confidence": getattr(d, 'confidence', 1.0) or 1.0,
            "context_key": getattr(d, 'context_key', 'default'),
            "timestamp": d.timestamp.isoformat() if d.timestamp else None
        })
        
    return {
        "session_id": session_id,
        "engagement_score": round(eval_log.engagement_score, 2) if eval_log else 0.0,
        "quiz_score": round(eval_log.quiz_score, 2) if eval_log else 0.0,
        "number_of_adaptations": len([d for d in decisions if d.final_decision != "maintain"]),
        "adaptations": timeline
    }

# --- 11. DRILL-DOWN DASHBOARD ---
@router.get("/session/{session_id}/details")
def get_session_details(session_id: int, db: Session = Depends(get_db)):
    """Yields absolute raw arrays of interactions, contextual mapping, and rewards."""
    interactions = db.query(InteractionLog).filter(InteractionLog.session_id == session_id).order_by(InteractionLog.timestamp.asc()).all()
    decisions = db.query(DecisionLog).filter(DecisionLog.session_id == session_id).order_by(DecisionLog.timestamp.asc()).all()
    eval_log = db.query(EvaluationLog).filter(EvaluationLog.session_id == session_id).first()
    
    return {
        "session_id": session_id,
        "raw_interactions": [{"type": i.event_type, "time": i.timestamp.isoformat() if i.timestamp else None} for i in interactions],
        "decision_logs": [{"action": d.final_decision, "context_key": getattr(d, 'context_key', 'default'), "time": d.timestamp.isoformat() if d.timestamp else None} for d in decisions],
        "rewards_overview": {
            "engagement_score": round(eval_log.engagement_score, 2) if eval_log else 0.0,
            "quiz_score": round(eval_log.quiz_score, 2) if eval_log else 0.0
        }
    }

# --- 12. A/B COMPARISON VIEW ---
@router.get("/dashboard/ab-test")
def get_ab_comparison(db: Session = Depends(get_db)):
    """Computes specific Control vs Experiment (ab_group) telemetry mapping explicitly"""
    
    def get_group_metrics(group_name: str):
        sessions = db.query(SessionModel).filter(SessionModel.ab_group == group_name).all()
        session_ids = [s.id for s in sessions]
        
        if not session_ids:
            return {"avg_engagement": 0.0, "avg_quiz": 0.0, "success_rate": 0.0}
            
        evals = db.query(EvaluationLog).filter(EvaluationLog.session_id.in_(session_ids)).all()
        if not evals:
            return {"avg_engagement": 0.0, "avg_quiz": 0.0, "success_rate": 0.0}
            
        avg_eng = sum(e.engagement_score for e in evals) / len(evals)
        avg_qz = sum(e.quiz_score for e in evals) / len(evals)
        successes = sum(1 for e in evals if e.adaptation_success > 0)
        
        return {
            "avg_engagement": round(avg_eng, 2),
            "avg_quiz": round(avg_qz, 2),
            "success_rate": round(successes / len(evals), 2)
        }
        
    group_a = get_group_metrics("control")
    group_b = get_group_metrics("experiment")
    
    delta = {
        "engagement_delta": round(group_b["avg_engagement"] - group_a["avg_engagement"], 2),
        "quiz_delta": round(group_b["avg_quiz"] - group_a["avg_quiz"], 2),
        "success_rate_delta": round(group_b["success_rate"] - group_a["success_rate"], 2)
    }
    
    return {
        "group_a_control": group_a,
        "group_b_experiment": group_b,
        "comparison_delta": delta
    }

@router.get("/dashboard/actions")
def get_action_metrics(db: Session = Depends(get_db)):
    """Retrieves all global reinforcement action metrics deterministically"""
    metrics = db.query(ActionMetrics).all()
    results = []
    for m in metrics:
        success_rate = (m.success_count / m.total_attempts) if m.total_attempts > 0 else 0.0
        results.append({
            "name": m.action_name,
            "success_rate": round(success_rate, 2),
            "avg_reward": round(m.avg_reward, 2)
        })
    return {"actions": results}

@router.get("/dashboard/insights")
def get_dashboard_insights(db: Session = Depends(get_db)):
    """Generates dynamically derived insights from RL action metrics natively"""
    insights = []
    
    def get_confidence(attempts: int) -> float:
        return min(1.0, attempts / 50.0)
    
    # 1. Evaluate Audio performance under Fatigue
    audio_fatigue = db.query(ActionMetrics).filter(ActionMetrics.action_name == "switch_to_audio", ActionMetrics.context_key == "fatigue").first()
    if audio_fatigue and audio_fatigue.total_attempts > 0:
        conf = get_confidence(audio_fatigue.total_attempts)
        if conf > 0.5:
            win_rate = int((audio_fatigue.success_count / audio_fatigue.total_attempts) * 100)
            insights.append({"message": f"Audio mode improved engagement by {win_rate}% in fatigue sessions", "confidence": round(conf, 2)})
            
    # 2. Evaluate Targeted Simplification
    simplify = db.query(ActionMetrics).filter(ActionMetrics.action_name == "targeted_simplification").first()
    if simplify and simplify.total_attempts > 0:
        conf = get_confidence(simplify.total_attempts)
        if conf > 0.5:
            win_rate = int((simplify.success_count / simplify.total_attempts) * 100)
            insights.append({"message": f"Targeted simplification improved quiz scores organically by {win_rate}%", "confidence": round(conf, 2)})
            
    # 3. Evaluate Visual Mapping for Confusion
    visual = db.query(ActionMetrics).filter(ActionMetrics.action_name == "switch_to_visual", ActionMetrics.context_key == "confusion").first()
    if visual and visual.total_attempts > 0:
        conf = get_confidence(visual.total_attempts)
        if conf > 0.5:
            win_rate = int((visual.success_count / visual.total_attempts) * 100)
            insights.append({"message": f"Visual switching mitigated conceptual blockage by {win_rate}%", "confidence": round(conf, 2)})
            
    # 4. Global generic fallback
    if not insights:
        insights.append({"message": "Need more data. Gathering foundational metric traces to generate predictive bounds.", "confidence": 0.0})
        
    return {"insights": insights}

@router.get("/dashboard/export/csv")
def export_interactions_csv(db: Session = Depends(get_db)):
    """Exports a raw deterministic CSV of every interaction natively"""
    interactions = db.query(InteractionLog).order_by(InteractionLog.timestamp.desc()).limit(1000).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["session_id", "timestamp", "event_type", "event_value"])
    
    for i in interactions:
        writer.writerow([
            i.session_id,
            i.timestamp.isoformat() if i.timestamp else "",
            i.event_type,
            i.event_value
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=interactions_export.csv"}
    )
