import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.modules.content.repository.loader import get_content, load_content, validate_content_dataset
from src.modules.content.transformer.mapper import transform_content


def run_validation() -> None:
    issues = validate_content_dataset()
    assert not issues, f"Dataset validation failed: {issues}"

    default_content = get_content("photosynthesis", "default")
    simplified_content = get_content("photosynthesis", "simplified")
    chunked_content = get_content("photosynthesis", "chunked")
    visual_content = get_content("photosynthesis", "visual")

    assert isinstance(default_content, str) and default_content
    assert isinstance(simplified_content, str) and simplified_content
    assert isinstance(chunked_content, list) and chunked_content
    assert isinstance(visual_content, dict) and visual_content["text"] and visual_content["diagram"]

    simplified_payload = transform_content("photosynthesis", {"action": "simplify", "intensity": 0.8})
    chunked_payload = transform_content("photosynthesis", {"action": "reduce_pace", "intensity": 0.8})
    summary_payload = transform_content("photosynthesis", {"action": "summarize", "intensity": 0.8})
    visual_payload = transform_content("photosynthesis", {"action": "visual_mode", "intensity": 0.8})

    assert simplified_payload["variant"] == "simplified"
    assert chunked_payload["variant"] == "chunked"
    assert summary_payload["variant"] == "summary"
    assert visual_payload["mode"] == "visual"
    assert "content" in visual_payload and "diagram" in visual_payload["content"]

    quiz_payload = load_content("photosynthesis")
    quiz_questions = quiz_payload["quiz"]
    assert quiz_payload["topic"] == "Photosynthesis"
    assert len(quiz_questions) >= 4
    assert all(question.get("question") for question in quiz_questions)
    assert all(question.get("options") for question in quiz_questions)

    print("Content validation passed.")
    print("Variant switching works.")
    print("Quiz loading works.")
    print("Adaptive content mapping works.")


if __name__ == "__main__":
    run_validation()
