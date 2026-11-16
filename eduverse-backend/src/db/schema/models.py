from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Learner(Base):
    __tablename__ = 'learners'
    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Session(Base):
    __tablename__ = 'sessions'
    id = Column(Integer, primary_key=True, index=True)
    learner_id = Column(Integer, ForeignKey('learners.id'))
    topic_id = Column(String, index=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    ab_group = Column(String, default="control")
    strategy_mode = Column(String, default="balanced")

class InteractionLog(Base):
    __tablename__ = 'interaction_logs'
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey('sessions.id'))
    event_type = Column(String)
    event_value = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

class DecisionLog(Base):
    __tablename__ = 'decision_logs'
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey('sessions.id'))
    agent = Column(String)
    proposed_action = Column(String)
    content_type = Column(String, default="text")
    confidence = Column(Float)
    final_decision = Column(String)
    action_intensity = Column(Float, nullable=True) # Phase 2 Parametric Intensity
    context_key = Column(String, default="default")
    explanation = Column(String, nullable=True) # Phase E Addition
    is_applied = Column(Integer, default=1)
    timestamp = Column(DateTime, default=datetime.utcnow)
    # The second 'timestamp' column in the instruction is redundant and would overwrite the first.
    # Keeping only one 'timestamp' for syntactic correctness and logical consistency.

class EvaluationLog(Base):
    __tablename__ = 'evaluation_logs'
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey('sessions.id'))
    engagement_score = Column(Float)
    completion_rate = Column(Float)
    adaptation_success = Column(Float)
    quiz_score = Column(Float, default=0.0)
    learning_effectiveness = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow)

class QuizAttempt(Base):
    """Tracks learner quiz evaluation events natively"""
    __tablename__ = 'quiz_attempts'
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey('sessions.id'))
    topic_id = Column(String, index=True)
    score = Column(Float)
    difficulty_level = Column(String) # 'easy', 'medium', 'hard'
    weak_concept = Column(String, nullable=True) # Tracks specific conceptual breaks
    responses_json = Column(String, nullable=True) # Optional payload dump
    created_at = Column(DateTime, default=datetime.utcnow)

class Quiz(Base):
    """Stores quiz questions by topic for dataset-backed delivery."""
    __tablename__ = 'quiz'
    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, index=True)
    question = Column(String)
    options = Column(JSON, nullable=False)
    correct = Column(String)
    concept = Column(String, nullable=True)
    difficulty = Column(String, default="easy")
    created_at = Column(DateTime, default=datetime.utcnow)

class ActionMetrics(Base):
    """Tracks global deterministic reinforcement learning outcomes"""
    __tablename__ = 'action_metrics'
    id = Column(Integer, primary_key=True, index=True)
    action_name = Column(String, index=True)
    context_key = Column(String, index=True, default="default")
    total_attempts = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    avg_reward = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ModalityMetrics(Base):
    """Tracks global deterministic performance variations across Hybrid content modes"""
    __tablename__ = 'modality_metrics'
    id = Column(Integer, primary_key=True, index=True)
    mode = Column(String, unique=True, index=True)
    total_attempts = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    avg_engagement_delta = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
