from sqlalchemy.orm import Session
from src.db.schema.models import ActionMetrics

class Orchestrator:
    def __init__(self):
        self.priority_map = {
            "accessibility": 1,
            "engagement": 2
        }

    def resolve(self, decisions: list[dict], db: Session = None, context_key: str = "default") -> dict:
        """
        Resolves conflicts natively applying strict Phase C Context-Aware RL bounds safely explicitly skipping <5 limits.
        """
        if not decisions:
            return {"final_action": "maintain", "chosen_agent": "none", "confidence": 1.0, "reinforcement_applied": False, "reward_influence": 0.0}

        active_decisions = []
        for d in decisions:
            act = d["proposed_action"]["action"] if isinstance(d["proposed_action"], dict) else d["proposed_action"]
            if act != "maintain":
                active_decisions.append(d)
        
        if not active_decisions:
            return {"final_action": {"action": "maintain", "intensity": 0.0}, "chosen_agent": "all", "confidence": 1.0, "reinforcement_applied": False, "reward_influence": 0.0}

        for d in active_decisions:
            action_name = d["proposed_action"]["action"] if isinstance(d["proposed_action"], dict) else d["proposed_action"]
            boost = 0.0
            applied = False
            
            if db:
                metric = db.query(ActionMetrics).filter(ActionMetrics.action_name == action_name, ActionMetrics.context_key == context_key).first()
                # Exploration safeguard natively implemented directly rejecting < 5 metric traces
                if metric and metric.total_attempts >= 5:
                    boost = metric.avg_reward * 0.2
                    applied = True
            
            d["base_confidence"] = d["confidence"]
            d["confidence"] = d["confidence"] + boost
            d["reinforcement_applied"] = applied
            d["reward_influence"] = boost

        active_decisions.sort(key=lambda x: (
            self.priority_map.get(x["agent"], 99), 
            -x["confidence"]
        ))
        
        best_decision = active_decisions[0]
        
        return {
            "final_action": best_decision["proposed_action"],
            "chosen_agent": best_decision["agent"],
            "confidence": best_decision["confidence"],
            "reinforcement_applied": best_decision.get("reinforcement_applied", False),
            "reward_influence": best_decision.get("reward_influence", 0.0)
        }
