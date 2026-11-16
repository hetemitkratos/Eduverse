from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.db.database import get_db
from src.db.schema.models import Session as SessionModel
from src.modules.adaptive.service import get_adaptation_decision
from src.modules.content.transformer.mapper import transform_content
from src.modules.interaction.service import get_session_state

router = APIRouter(prefix="/api/session", tags=["Adaptation"])

@router.get("/{session_id}/adaptation")
def get_adaptation(session_id: int, db: Session = Depends(get_db)):
    decision = get_adaptation_decision(db, session_id)
    
    session_row = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if session_row:
        state = get_session_state(session_id)
        content_payload = transform_content(session_row.topic_id, decision["final_action"], state.weak_concepts)
        # Track the active delivery mode on the session state
        if content_payload.get("mode"):
            state.current_format = content_payload["mode"]
    else:
        content_payload = {"type": "error", "data": "session not found"}
        
    return {
        "decision": decision["final_action"],
        "content": content_payload,
        "reason": decision.get("reason", "agent selected"),
        "confidence": decision.get("confidence", 1.0),
        "reinforcement_applied": decision.get("reinforcement_applied", False),
        "reward_influence": round(decision.get("reward_influence", 0.0), 4)
    }

@router.get("/{session_id}/system-state")
def get_session_state_dump(session_id: int):
    """Returns the full in-memory SessionState for inspection / demo purposes."""
    state = get_session_state(session_id)
    dump = state.model_dump()
    # Convert non-serializable values
    dump["session_start_time"] = round(dump.get("session_start_time", 0), 2)
    dump["last_adaptation_time"] = round(dump.get("last_adaptation_time", 0), 2)
    return {"session_id": session_id, "state": dump}
