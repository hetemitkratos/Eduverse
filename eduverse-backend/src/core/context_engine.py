from src.core.models.session_state import SessionState

def get_session_phase(state: SessionState) -> str:
    """
    Phase 7 Temporal Awareness
    Calculates phase dynamically based on interaction counts for now (early: < 25%, mid: < 75%, late: > 75%)
    Assuming standard session ~40 interactions
    """
    if state.interaction_count < 10:
        return "early"
    elif state.interaction_count < 30:
        return "mid"
    return "late"

def compute_slope(values: list[float]) -> float:
    if len(values) < 2: return 0.0
    x = list(range(len(values)))
    mean_x = sum(x) / len(x)
    mean_y = sum(values) / len(values)
    num = sum((xi - mean_x) * (yi - mean_y) for xi, yi in zip(x, values))
    den = sum((xi - mean_x) ** 2 for xi in x)
    return num / den if den != 0 else 0.0

def moving_average(values: list[float], window: int = 3) -> list[float]:
    if not values: return []
    smoothed = []
    for i in range(len(values)):
        start = max(0, i - window + 1)
        window_slice = values[start:i+1]
        smoothed.append(sum(window_slice) / len(window_slice))
    return smoothed

def generate_context(state: SessionState) -> dict:
    """
    Computes real-time situational context deterministically derived entirely from Interaction stats.
    Phase 1: Added Temporal Context Engine smoothing and trend mapping.
    """
    # Use smoothed recent metrics for trends
    smoothed_eng = moving_average(state.recent_engagement_scores, 3)
    smoothed_pause = moving_average(state.recent_pause_rates, 3)
    
    eng_slope = compute_slope(smoothed_eng[-5:]) if len(smoothed_eng) >= 2 else 0.0
    if eng_slope > 0.01:
        engagement_trend = "increasing"
    elif eng_slope < -0.01:
        engagement_trend = "decreasing"
    else:
        engagement_trend = "stable"
        
    pause_slope = compute_slope(smoothed_pause[-5:]) if len(smoothed_pause) >= 2 else 0.0
    if pause_slope > 0.01:
        fatigue_trend = "rising"
    elif pause_slope < -0.01:
        fatigue_trend = "falling"
    else:
        fatigue_trend = "stable"
        
    context = {
        "fatigue": state.pause_rate >= 0.4,
        "confusion": state.revisit_count >= 2,
        "low_learning": state.last_quiz_score < 0.5,
        "engagement_trend": engagement_trend,
        "fatigue_trend": fatigue_trend,
        "session_phase": get_session_phase(state),
        "current_mode": state.current_format,
        "weak_concepts": state.weak_concepts
    }
    
    state.context_history.append(context)
    if len(state.context_history) > 10:
        state.context_history.pop(0)
        
    return context
