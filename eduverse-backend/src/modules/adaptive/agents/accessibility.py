from src.core.models.session_state import SessionState
from src.modules.content.concept_graph import resolve_learning_gap

class AccessibilityAgent:
    def __init__(self):
        pass # Thresholds shifted to Context Vector system

    def evaluate(self, state: SessionState) -> dict:
        """
        Monitors context vector for combinations like fatigue, confusion, and learning drops
        """
        confidence = 0.0
        action = "maintain"
        intensity = 0.0
        ctx = state.context

        # IF concept failure: -> targeted simplification
        if len(ctx.get("weak_concepts", [])) > 0:
            weak_concept = ctx.get("weak_concepts")[0]
            gap_resolution = resolve_learning_gap(weak_concept)
            target_concept = gap_resolution.get("fallback_concept") or weak_concept
            
            return {
                "agent": "accessibility", 
                "proposed_action": {
                    "action": "targeted_simplification", 
                    "intensity": 0.9,
                    "target_concept": target_concept
                }, 
                "confidence": 0.95
            }

        # IF late AND fatigue: -> stronger adaptation
        if ctx.get("session_phase") == "late" and ctx.get("fatigue"):
            return {"agent": "accessibility", "proposed_action": {"action": "simplify_chunk_audio", "intensity": 1.0}, "confidence": 0.99}

        # IF stable engagement: -> NO adaptation
        if ctx.get("engagement_trend") == "stable":
            return {"agent": "accessibility", "proposed_action": {"action": "maintain", "intensity": 0.0}, "confidence": 1.0}

        # IF fatigue AND low_learning: -> action = "simplify_chunk_audio"
        if ctx.get("fatigue") and ctx.get("low_learning"):
            action = "simplify_chunk_audio"
            intensity = 0.8
            confidence = 0.95
            
        # IF confusion AND NOT fatigue: -> action = "switch_to_visual"
        elif ctx.get("confusion") and not ctx.get("fatigue"):
            if ctx.get("current_mode") != "visual":
                action = "switch_to_visual"
                intensity = 0.7
                confidence = 0.90
                
        # Individual states
        elif ctx.get("fatigue"):
            if ctx.get("current_mode") != "audio":
                action = "switch_to_audio"
                intensity = 0.6
                confidence = 0.85
                
        elif ctx.get("confusion"):
            if ctx.get("current_mode") != "visual":
                action = "switch_to_visual"
                intensity = 0.6
                confidence = 0.85

        return {"agent": "accessibility", "proposed_action": {"action": action, "intensity": intensity}, "confidence": confidence}
