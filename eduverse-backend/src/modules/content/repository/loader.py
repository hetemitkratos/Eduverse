import json
from functools import lru_cache
from pathlib import Path

_CONTENT_DB_PATH = Path(__file__).resolve().parents[4] / "data" / "content.json"
_TEXT_VARIANTS = {"default", "simplified", "summary"}
_REQUIRED_VARIANTS = {"default", "simplified", "chunked", "summary", "visual"}


@lru_cache(maxsize=1)
def load_content_dataset() -> dict:
    """Load the content dataset once and keep it cached for the app lifetime."""
    try:
        with _CONTENT_DB_PATH.open("r", encoding="utf-8") as file_handle:
            data = json.load(file_handle)
            return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def preload_content() -> dict:
    """Explicit preload hook for startup or import-time warmup."""
    return load_content_dataset()


def load_content(topic_id: str):
    """Return the full topic payload, including content variants and quiz data."""
    return load_content_dataset().get(topic_id)


def _normalize_variant_content(content: dict, variant: str):
    """Return variant content in a consistent shape for downstream APIs."""
    if variant == "chunked":
        chunked = content.get("chunked", [])
        return chunked if isinstance(chunked, list) else [str(chunked)]

    if variant == "visual":
        visual = content.get("visual", {})
        if isinstance(visual, dict):
            return {
                "text": str(visual.get("text", "")),
                "diagram": str(visual.get("diagram", "")),
            }
        return {"text": "", "diagram": str(visual)}

    if variant in _TEXT_VARIANTS:
        return str(content.get(variant, ""))

    return str(content.get("default", ""))


def get_content(topic_id: str, variant: str = "default"):
    """Return a specific content variant for a topic."""
    topic_payload = load_content(topic_id)
    if not topic_payload:
        return None

    content = topic_payload.get("content", {})
    return _normalize_variant_content(content, variant)


def validate_content_dataset() -> list[str]:
    """Return a list of dataset validation issues, if any."""
    issues = []
    dataset = load_content_dataset()

    if not dataset:
        return ["Content dataset is empty or failed to load."]

    for topic_key, topic_payload in dataset.items():
        content = topic_payload.get("content", {})
        quiz_items = topic_payload.get("quiz", [])

        missing_variants = sorted(_REQUIRED_VARIANTS - set(content.keys()))
        if missing_variants:
            issues.append(
                f"{topic_key}: missing content variants: {', '.join(missing_variants)}"
            )

        for variant in _TEXT_VARIANTS:
            value = content.get(variant)
            if not isinstance(value, str) or not value.strip():
                issues.append(f"{topic_key}: invalid or empty '{variant}' content")

        chunked = content.get("chunked")
        if not isinstance(chunked, list) or not chunked or any(not str(item).strip() for item in chunked):
            issues.append(f"{topic_key}: invalid or empty 'chunked' content")

        visual = content.get("visual")
        if not isinstance(visual, dict) or not str(visual.get("text", "")).strip() or not str(visual.get("diagram", "")).strip():
            issues.append(f"{topic_key}: invalid or empty 'visual' content")

        if not isinstance(quiz_items, list) or not quiz_items:
            issues.append(f"{topic_key}: quiz is missing")
            continue

        for index, quiz_item in enumerate(quiz_items, start=1):
            if not str(quiz_item.get("question", "")).strip():
                issues.append(f"{topic_key}: quiz question {index} is missing text")
            if not isinstance(quiz_item.get("options"), list) or len(quiz_item.get("options", [])) < 2:
                issues.append(f"{topic_key}: quiz question {index} has invalid options")
            if not str(quiz_item.get("correct", quiz_item.get("answer", ""))).strip():
                issues.append(f"{topic_key}: quiz question {index} is missing a correct answer")
            if not str(quiz_item.get("concept", "")).strip():
                issues.append(f"{topic_key}: quiz question {index} is missing a concept")

    return issues


def upsert_content_dataset(topic_id: str, new_data: dict):
    """Safely updates or inserts a topic into the deterministic content store."""
    dataset = load_content_dataset().copy()
    
    keys_to_remove = [k for k in dataset.keys() if k.lower() == topic_id.lower()]
    for k in keys_to_remove:
        del dataset[k]
        
    dataset[topic_id] = new_data
    
    with _CONTENT_DB_PATH.open("w", encoding="utf-8") as file_handle:
        json.dump(dataset, file_handle, indent=4)
        
    # Clear cache so next load gets fresh data
    load_content_dataset.cache_clear()
    preload_content()

preload_content()
