import time
from sqlalchemy.orm import Session
from src.db.schema.models import DecisionLog
from src.modules.interaction.service import get_session_state
from src.modules.adaptive.agents.engagement import EngagementAgent
from src.modules.adaptive.agents.accessibility import AccessibilityAgent
from src.modules.adaptive.orchestrator.resolver import Orchestrator
from src.core.context_engine import generate_context
from src.core.strategy_engine import get_strategy_config

engagement_agent = EngagementAgent()
accessibility_agent = AccessibilityAgent()
orchestrator = Orchestrator()

def generate_context_key(context: dict) -> str:
    keys = []
    if context.get("fatigue"): keys.append("fatigue")
    if context.get("confusion"): keys.append("confusion")
    if context.get("low_learning"): keys.append("low_quiz")
    if not keys: return "default"
    return "_".join(keys)

def get_adaptation_decision(db: Session, session_id: int):
    # Retrieve cache state
    state = get_session_state(session_id)
    
    # Calculate Base Strategy Map
    strategy = get_strategy_config(state.strategy_mode)
    
    # Synthesize situational context dynamically before agent resolutions
    state.context = generate_context(state)
    context_key = generate_context_key(state.context)

    # Quiz Failure Constraint explicitly forces Simplify + Chunk globally
    if state.context.get("low_quiz_score", False):
        return {"final_action": {"action": "simplify_chunk", "intensity": 1.0}, "chosen_agent": "system_enforcer", "reason": "Quiz Failure constraints enforced", "confidence": 1.0, "reinforcement_applied": False, "reward_influence": 0.0}

    current_time = time.time()
    
    if (current_time - state.last_adaptation_time) < strategy["cooldown"] and state.last_adaptation_time > 0:
        return {"final_action": "maintain", "reason": f"Strategy locked: {strategy['cooldown']}s cooldown", "confidence": 1.0}
        
    # Process multi-agent evaluations
    eng_decision = engagement_agent.evaluate(state)
    acc_decision = accessibility_agent.evaluate(state)
    
    final_decision = orchestrator.resolve([eng_decision, acc_decision], db, context_key=context_key)
    
    if final_decision.get("confidence", 1.0) < 0.4:
        final_decision["final_action"] = {"action": "default", "intensity": 0.0}
        final_decision["reason"] = "low_confidence_fallback"

    action_obj = final_decision["final_action"]
    action_name = action_obj.get("action", "maintain") if isinstance(action_obj, dict) else action_obj
    action_intensity = action_obj.get("intensity", 1.0) if isinstance(action_obj, dict) else 1.0

    if action_name in state.recent_decisions[-3:]:
        if action_name != "maintain":
            final_decision["final_action"] = {"action": "maintain", "intensity": 0.0}
            action_name = "maintain"
            action_intensity = 0.0
            final_decision["reason"] = "prevent_oscillation"

    if action_name != "maintain":
        state.last_adaptation_time = current_time
        state.recent_decisions.append(action_name)
        state.recent_decisions = state.recent_decisions[-3:]
    
    # Assess Content Type Modality Selection
    content_type = "text"
    if action_name == "switch_to_audio":
        content_type = "audio"
    elif action_name == "switch_to_visual":
        content_type = "visual"
    elif "," in action_name:
        content_type = "hybrid"

    # Persist log with modality and extracted ContextKey for RL
    log_entry = DecisionLog(
        session_id=session_id,
        agent=final_decision.get("chosen_agent", "system"),
        proposed_action=action_name,
        action_intensity=action_intensity,
        content_type=content_type,
        confidence=final_decision.get("confidence", 1.0),
        final_decision=action_name,
        context_key=context_key
    )
    db.add(log_entry)
    db.commit()
    
    return final_decision
