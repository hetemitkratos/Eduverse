from sqlalchemy.orm import Session
from src.db.schema.models import InteractionLog
from src.core.types.requests import InteractionRequest
from src.core.models.session_state import SessionState

# In a scaled environment, use Redis for session states.
# For simplicity and isolation, using an in-memory dictionary here.
_session_states = {}

def get_session_state(session_id: int) -> SessionState:
    if session_id not in _session_states:
        _session_states[session_id] = SessionState(session_id=session_id)
    return _session_states[session_id]

def log_interaction(db: Session, request: InteractionRequest) -> SessionState:
    # Persist interaction log to database
    log_entry = InteractionLog(
        session_id=request.session_id,
        event_type=request.event_type,
        event_value=request.event_value
    )
    db.add(log_entry)
    db.commit()

    # Aggregate metric in SessionState
    state = get_session_state(request.session_id)
    
    if request.event_type == 'pause':
        # Simple weighted average / accumulator logic for demo
        state.pause_rate = (state.pause_rate + request.event_value) / 2.0
    elif request.event_type == 'revisit':
        state.revisit_count += int(request.event_value)
    elif request.event_type == 'idle':
        state.idle_time += request.event_value

    state.interaction_count += 1

    # PHASE 1: Compute context after Interaction Analyzer and store in SessionState
    from src.core.context_engine import generate_context
    state.context = generate_context(state)

    return state
