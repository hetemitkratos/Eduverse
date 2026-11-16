from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import time

class SessionState(BaseModel):
    """
    Formal Session State Object (State Management Layer)
    """
    session_id: int
    strategy_mode: str = "balanced"
    interaction_count: int = 0
    pause_rate: float = 0.0
    revisit_count: int = 0
    idle_time: float = 0.0
    interaction_density: float = 0.0
    current_format: str = "text"
    previous_engagement_score: float = 1.0
    
    # Quiz tracking extensions
    last_quiz_score: float = 0.0
    previous_quiz_score: float = 0.0
    difficulty_level: str = "easy"
    weak_concepts: List[str] = Field(default_factory=list)

    # Context Engine Extensions
    context: Dict[str, Any] = Field(default_factory=dict)
    context_history: List[Dict[str, Any]] = Field(default_factory=list)
    recent_pause_rates: List[float] = Field(default_factory=list)
    
    # Advanced Architectural Tracking
    recent_engagement_scores: List[float] = Field(default_factory=list)
    recent_rewards: List[float] = Field(default_factory=list) # Phase 3 Delayed Reward Extension
    baseline_engagement_score: Optional[float] = None
    session_start_time: float = Field(default_factory=time.time)
    last_adaptation_time: float = 0.0
    recent_decisions: List[str] = Field(default_factory=list)
