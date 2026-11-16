from sqlalchemy.orm import Session
from src.db.schema.models import ActionMetrics, DecisionLog, ModalityMetrics
from src.modules.interaction.service import get_session_state
from src.modules.logging.evaluation.logger import log_evaluation_report

def process_session_evaluation(db: Session, session_id: int):
    state = get_session_state(session_id)
    
    e_after = (0.5 * state.pause_rate) + (0.3 * state.revisit_count * 0.1) + (0.2 * min(state.idle_time / 60.0, 1.0))
    e_before = state.previous_engagement_score
    
    delta_e = e_before - e_after
    if e_before > 0:
        adaptation_success = delta_e / e_before
    else:
        adaptation_success = 0.0
        
    state.previous_engagement_score = max(0.01, e_after)
    
    engagement_score = max(0.0, 1.0 - e_after)
    completion_rate = min(1.0, state.revisit_count * 0.2 + 0.5)

    # Push metrics to sliding windows for trend computation
    state.recent_engagement_scores.append(engagement_score)
    if len(state.recent_engagement_scores) > 10:
        state.recent_engagement_scores.pop(0)
    state.recent_pause_rates.append(state.pause_rate)
    if len(state.recent_pause_rates) > 10:
        state.recent_pause_rates.pop(0) 
    
    # Adaptive Quiz Integration (Phase 4)
    quiz_score = state.last_quiz_score
    learning_effectiveness = (quiz_score + engagement_score) / 2.0
    
    log_evaluation_report(
        db, session_id, engagement_score, completion_rate, 
        adaptation_success, quiz_score, learning_effectiveness
    )
    
    # Phase 5: Predictive Strategy Switching (skip in demo mode)
    from src.db.schema.models import Session as SessionModel
    
    if state.strategy_mode != "demo":
        # Reactive Drop
        if learning_effectiveness < 0.4:
            state.strategy_mode = "conservative"
        # Predictive Drop Early Warning
        elif state.context.get("engagement_trend") == "decreasing" and learning_effectiveness < 0.6:
            state.strategy_mode = "conservative"
        # Recovery
        elif learning_effectiveness > 0.7 and state.context.get("engagement_trend") != "decreasing":
            if state.strategy_mode == "conservative":
                state.strategy_mode = "balanced"
            
    session_obj = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if session_obj:
        session_obj.strategy_mode = state.strategy_mode
        db.commit()
    
    # --- PHASE 6 / C: CONTEXT-AWARE REINFORCEMENT UPDATES ---
    last_decision = db.query(DecisionLog).filter(DecisionLog.session_id == session_id).order_by(DecisionLog.timestamp.desc()).first()
    
    if last_decision and last_decision.final_decision != "maintain":
        action_name = last_decision.final_decision
        context_key = getattr(last_decision, 'context_key', 'default')
        if not context_key: context_key = "default"
        
        # 1. Advanced Configurable Reward Calculation
        if state.strategy_mode == "aggressive":
            alpha, beta, gamma = 0.6, 0.3, 0.1
        elif state.strategy_mode == "conservative":
            alpha, beta, gamma = 0.3, 0.6, 0.1
        else: # balanced
            alpha, beta, gamma = 0.4, 0.4, 0.2
            
        base_reward = (alpha * delta_e) + (beta * quiz_score) + (gamma * completion_rate)
        # Normalize strictly to [0,1]
        reward = max(0.0, min(1.0, base_reward))
        
        # Phase 3: Delayed Reward System Computation
        state.recent_rewards.append(reward)
        if len(state.recent_rewards) > 3:
            state.recent_rewards.pop(0)
            
        weights = [0.5, 0.3, 0.2]
        delayed_reward = 0.0
        rev_rewards = state.recent_rewards[::-1]
        for i, r in enumerate(rev_rewards):
            delayed_reward += weights[i] * r
            
        used_weights = sum(weights[:len(rev_rewards)])
        if used_weights > 0:
            delayed_reward /= used_weights
        
        
        # 2. Success Definition
        quiz_improved = quiz_score > state.previous_quiz_score
        is_success = (delta_e > 0) or quiz_improved
        
        # 3. Update Context-bound ActionMetrics traces
        # Modify RL lookup: Uses action_name + context_key
        metric = db.query(ActionMetrics).filter(ActionMetrics.action_name == action_name, ActionMetrics.context_key == context_key).first()
        if not metric:
            metric = ActionMetrics(action_name=action_name, context_key=context_key, total_attempts=0, success_count=0, avg_reward=0.0)
            db.add(metric)
            
        metric.total_attempts += 1
        if is_success:
            metric.success_count += 1
            
        # 4. Exponential Decay using Delayed Reward mapping
        metric.avg_reward = (0.8 * metric.avg_reward) + (0.2 * delayed_reward)
        
        db.commit()

        # Phase B: Modality Metrics Update natively tracking hybrid variations
        current_mode = state.current_format
        mod_metric = db.query(ModalityMetrics).filter(ModalityMetrics.mode == current_mode).first()
        if not mod_metric:
            mod_metric = ModalityMetrics(mode=current_mode, total_attempts=0, success_count=0, avg_engagement_delta=0.0)
            db.add(mod_metric)
            
        mod_metric.total_attempts += 1
        if is_success:
            mod_metric.success_count += 1
            
        mod_metric.avg_engagement_delta = ((mod_metric.avg_engagement_delta * (mod_metric.total_attempts - 1)) + delta_e) / mod_metric.total_attempts
        db.commit()

    return {
        "session_id": session_id,
        "engagement_score": round(engagement_score, 2),
        "completion_rate": round(completion_rate, 2),
        "adaptation_success": round(adaptation_success, 4),
        "quiz_score": round(quiz_score, 2),
        "learning_effectiveness": round(learning_effectiveness, 4)
    }
