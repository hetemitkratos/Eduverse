def evaluate_quiz_answers(actual_answers: list[str], correct_answers: list[str]) -> tuple[float, list[bool]]:
    """Returns a deterministic ratio score and answer booleans natively"""
    if not actual_answers or not correct_answers:
        return 0.0, []
    
    correct_count = 0
    results = []
    for a, c in zip(actual_answers, correct_answers):
        is_correct = str(a).strip().lower() == str(c).strip().lower()
        results.append(is_correct)
        if is_correct:
            correct_count += 1
            
    return correct_count / len(correct_answers), results

def compute_next_difficulty(score: float, current_difficulty: str) -> str:
    """
    Rule-based Adaptation Logic explicitly tracking 'hard' bounds natively.
    """
    if score < 0.5:
        return "easy"
    elif score >= 0.8:
        if current_difficulty == "easy":
            return "medium"
        else:
            return "hard"
    return current_difficulty
