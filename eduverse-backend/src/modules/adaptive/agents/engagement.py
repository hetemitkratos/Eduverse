import time
import math
from src.core.models.session_state import SessionState

class EngagementAgent:
    def __init__(self, w_pause=0.5, w_revisit=0.3, w_idle=0.2, fallback_high=0.7, fallback_low=0.3):
        self.w_pause = w_pause
        self.w_revisit = w_revisit
        self.w_idle = w_idle
        self.fallback_high = fallback_high
        self.fallback_low = fallback_low

    def evaluate(self, state: SessionState) -> dict:
        """
        Evaluates dynamic engagement explicitly recalculating bounds via Std and Mean traces natively. 
        Hooks mathematically onto baseline comparisons.
        """
        e_score = (self.w_pause * state.pause_rate) + \
                  (self.w_revisit * state.revisit_count * 0.1) + \
                  (self.w_idle * min(state.idle_time / 60.0, 1.0))

        # Dynamic array append 
        current_time = time.time()
        elapsed = current_time - state.session_start_time

        state.recent_engagement_scores.append(e_score)
        if len(state.recent_engagement_scores) > 10:
            state.recent_engagement_scores.pop(0)

        # Baseline Engine logic (Locks continuously across first 120s timeframe)
        if elapsed <= 120:
            state.baseline_engagement_score = sum(state.recent_engagement_scores) / len(state.recent_engagement_scores)

        from src.core.strategy_engine import get_strategy_config
        strategy = get_strategy_config(state.strategy_mode)

        # Compute pure adaptive thresholds safely
        if len(state.recent_engagement_scores) >= 3:
            mean_e = sum(state.recent_engagement_scores) / len(state.recent_engagement_scores)
            variance = sum((x - mean_e) ** 2 for x in state.recent_engagement_scores) / len(state.recent_engagement_scores)
            std_e = math.sqrt(variance)
            
            threshold_high = mean_e + std_e + strategy["high_offset"]
            threshold_low = mean_e - std_e + strategy["low_offset"]
        else:
            threshold_high = self.fallback_high + strategy["high_offset"]
            threshold_low = self.fallback_low + strategy["low_offset"]

        confidence = round(min(e_score, 1.0), 2)

        # Strict relative PRD configuration bound:
        if state.baseline_engagement_score is not None and elapsed > 120:
            if e_score > state.baseline_engagement_score:
                return {"agent": "engagement", "proposed_action": {"action": "reduce_pace", "intensity": 0.5}, "confidence": confidence}

        # IF stable engagement: -> NO adaptation
        if state.context.get("engagement_trend") == "stable":
            return {"agent": "engagement", "proposed_action": {"action": "maintain", "intensity": 0.0}, "confidence": 1.0}

        # Dynamic Threshold mappings
        if e_score > threshold_high:
            intensity = min(1.0, round(0.4 + (e_score - threshold_high), 2))
            return {"agent": "engagement", "proposed_action": {"action": "reduce_pace", "intensity": intensity}, "confidence": confidence}
        elif e_score < threshold_low:
            intensity = min(1.0, round(0.4 + (threshold_low - e_score), 2))
            return {"agent": "engagement", "proposed_action": {"action": "increase_pace", "intensity": intensity}, "confidence": round(1.0 - confidence, 2)}
        
        return {"agent": "engagement", "proposed_action": {"action": "maintain", "intensity": 0.0}, "confidence": 0.5}
