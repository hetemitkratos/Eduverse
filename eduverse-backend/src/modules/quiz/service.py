from sqlalchemy.orm import Session
from src.db.schema.models import Quiz, QuizAttempt, Session as SessionModel
from src.modules.content.repository.loader import load_content
from src.modules.quiz.evaluator import evaluate_quiz_answers, compute_next_difficulty
from src.modules.interaction.service import get_session_state
import json


def _sanitize_quiz_question(question_payload: dict) -> dict:
    return {
        "question": question_payload["question"],
        "options": question_payload.get("options", []),
        "concept": question_payload.get("concept"),
        "difficulty": question_payload.get("difficulty", "easy"),
    }


def fetch_quiz_by_topic(topic: str, db: Session) -> dict:
    quiz_rows = db.query(Quiz).filter(Quiz.topic == topic).order_by(Quiz.id.asc()).all()

    if not quiz_rows:
        content = load_content(topic)
        resolved_topic = content.get("topic") if content else None
        if resolved_topic:
            quiz_rows = (
                db.query(Quiz)
                .filter(Quiz.topic == resolved_topic)
                .order_by(Quiz.id.asc())
                .all()
            )

    if quiz_rows:
        return {
            "topic": quiz_rows[0].topic,
            "questions": [
                {
                    "question": row.question,
                    "options": row.options or [],
                    "concept": row.concept,
                    "difficulty": row.difficulty,
                }
                for row in quiz_rows
            ],
        }

    content = load_content(topic)
    if not content or "quiz" not in content:
        return {"error": "Quiz not found"}

    return {
        "topic": content.get("topic", topic),
        "questions": [_sanitize_quiz_question(question) for question in content["quiz"]],
    }

def fetch_quiz(session_id: int, db: Session) -> dict:
    session_row = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session_row:
        return {"error": "Session not found"}
        
    state = get_session_state(session_id)
    current_difficulty = state.difficulty_level
    
    content = load_content(session_row.topic_id)
    if not content or "quiz" not in content:
        return {"error": "Quiz not found"}
        
    filtered_quiz = [q for q in content["quiz"] if q.get("difficulty") == current_difficulty]
    
    sanitized_quiz = [_sanitize_quiz_question(question) for question in filtered_quiz]
    return {
        "topic": session_row.topic_id,
        "difficulty": current_difficulty,
        "questions": sanitized_quiz
    }

def evaluate_and_submit_quiz(session_id: int, answers: list[str], db: Session) -> dict:
    session_row = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session_row:
        return {"error": "Session not found"}
        
    state = get_session_state(session_id)
    current_difficulty = state.difficulty_level
    
    content = load_content(session_row.topic_id)
    if not content or "quiz" not in content:
        return {"error": "Quiz not found"}
        
    filtered_quiz = [q for q in content["quiz"] if q.get("difficulty") == current_difficulty]
    correct_answers = [q.get("correct", q.get("answer")) for q in filtered_quiz]
    
    score, results = evaluate_quiz_answers(answers, correct_answers)
    next_diff = compute_next_difficulty(score, current_difficulty)
    
    # Extract weak concepts explicitly based on correct answers boolean trace
    weak_concepts_list = []
    for q, passed in zip(filtered_quiz, results):
        if not passed and "concept" in q:
            weak_concepts_list.append(q["concept"])
            
    # Save natively to State Memory
    state.weak_concepts = list(set(weak_concepts_list))
    state.previous_quiz_score = state.last_quiz_score
    state.last_quiz_score = score
    state.difficulty_level = next_diff
    
    # Fallback to general tracking if no concept explicitly defined in JSON
    weak_concept = None
    if score < 0.5:
        weak_concept = ",".join(state.weak_concepts) if state.weak_concepts else f"{session_row.topic_id}_fundamentals"

    # Persist natively to DB
    attempt = QuizAttempt(
        session_id=session_id,
        topic_id=session_row.topic_id,
        score=score,
        difficulty_level=current_difficulty,
        weak_concept=weak_concept,
        responses_json=json.dumps(answers)
    )
    db.add(attempt)
    db.commit()
    
    return {
        "score": round(score, 2),
        "difficulty_next": next_diff,
        "feedback": "Great job, keep it up!" if score >= 0.8 else "Review the material and try again."
    }
