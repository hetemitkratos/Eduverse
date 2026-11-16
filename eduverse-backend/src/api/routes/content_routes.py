from fastapi import APIRouter, Query

from src.modules.content.repository.loader import get_content, load_content, load_content_dataset

router = APIRouter(prefix="/api", tags=["Content"])

# Static metadata for each topic key — controls how it appears in the learner UI
_TOPIC_META = {
    "photosynthesis": {
        "description": "How plants convert sunlight into food using carbon dioxide and water.",
        "difficulty": "beginner",
        "icon_key": "leaf",
        "estimated_minutes": 8,
    },
    "newtons_laws": {
        "description": "The three laws that explain how forces change the motion of objects.",
        "difficulty": "beginner",
        "icon_key": "zap",
        "estimated_minutes": 10,
    },
    "basic_electricity": {
        "description": "Current, voltage, resistance, and how circuits work.",
        "difficulty": "intermediate",
        "icon_key": "bolt",
        "estimated_minutes": 12,
    },
}


@router.get("/topics")
def list_topics():
    """Return all available learner topics with metadata for the topic picker."""
    dataset = load_content_dataset()
    topics = []
    for topic_id, payload in dataset.items():
        meta = _TOPIC_META.get(topic_id, {})
        
        is_ai_generated = payload.get("is_ai_generated", False)
        # fallback for UI just in case
        if topic_id not in _TOPIC_META:
            is_ai_generated = True

        concepts = list(payload.get("content", {}).get("concepts", {}).keys())
        
        topics.append({
            "id": topic_id,
            "title": payload.get("topic", topic_id.replace("_", " ").title()),
            "description": meta.get("description", "Learn about this topic adaptively."),
            "difficulty": "adaptive" if is_ai_generated else meta.get("difficulty", "beginner"),
            "icon_key": meta.get("icon_key", "zap"),
            "estimated_minutes": meta.get("estimated_minutes", 10),
            "quiz_count": len(payload.get("quiz", [])),
            "is_ai_generated": is_ai_generated,
            "concepts": concepts[:3]
        })
    return {"topics": topics}


@router.get("/content")
def get_content_by_topic(
    topic: str = Query(..., description="Topic identifier, such as 'photosynthesis'"),
    variant: str = Query("default", description="Content variant"),
):
    topic_payload = load_content(topic)
    if not topic_payload:
        return {"error": "Topic not found"}

    content = get_content(topic, variant)
    if content is None:
        return {"error": "Variant not found"}

    mode = "visual" if variant == "visual" else "text"
    return {
        "topic": topic_payload.get("topic", topic),
        "variant": variant,
        "mode": mode,
        "content": content,
    }


from src.modules.content.concept_graph import get_prerequisites, get_dependency_path

@router.get("/concept/dependencies")
def get_concept_dependencies(
    concept: str = Query(..., description="Concept to query dependencies for")
):
    """Return the immediate prerequisites and the full dependency chain for a given concept."""
    prereqs = get_prerequisites(concept)
    chain = get_dependency_path(concept)
    
    return {
        "concept": concept,
        "prerequisites": prereqs,
        "dependency_chain": chain
    }

from pydantic import BaseModel

class GenerateRequest(BaseModel):
    topic: str

@router.post("/content/generate")
def generate_topic(req: GenerateRequest):
    """Generate and store structured content dataset using LLM."""
    from src.modules.content.generator import generate_topic_content
    from src.modules.content.repository.loader import upsert_content_dataset
    try:
        dataset = generate_topic_content(req.topic)
        topic_id = req.topic.lower().replace(" ", "_")
        upsert_content_dataset(topic_id, dataset)
        return {"success": True, "topic_id": topic_id}
    except Exception as e:
        return {"error": str(e)}
