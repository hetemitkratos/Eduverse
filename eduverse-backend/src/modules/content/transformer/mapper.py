from src.modules.content.repository.loader import load_content

ACTION_VARIANT_MAP = {
    "simplify": "simplified",
    "reduce_pace": "chunked",
    "chunk": "chunked",
    "summarize": "summary",
    "increase_pace": "summary",
    "visual_mode": "visual",
    "switch_to_visual": "visual",
}


def _build_payload(payload_type: str, mode: str, variant: str, data, intensity: float) -> dict:
    return {
        "type": payload_type,
        "mode": mode,
        "variant": variant,
        "content": data,
        "data": data,
        "intensity": intensity,
    }


def map_decision_to_content(decision: dict | str, content: dict, weak_concepts: list = None) -> dict:
    """
    Deterministically maps an abstract decision to a specific 
    content variant payload (supporting multi-modal schemas).
    Overrides general content with concept-specific blocks if weak concepts exist.
    """
    action = decision.get("action", "maintain") if isinstance(decision, dict) else decision
    intensity = decision.get("intensity", 1.0) if isinstance(decision, dict) else 1.0
    target_concept = decision.get("target_concept") if isinstance(decision, dict) else None
    
    # Phase 4 Concept-Driven Override (Updated for Concept Graph Integration)
    if target_concept and "concepts" in content and target_concept in content["concepts"]:
        content = content["concepts"][target_concept]
        if action == "targeted_simplification":
            action = "simplify_chunk"
    elif weak_concepts and "concepts" in content:
        primary_concept = weak_concepts[0]
        if primary_concept in content["concepts"]:
            content = content["concepts"][primary_concept]
            # When forcing a targeted simplification, default the action if it's purely generic.
            if action == "targeted_simplification":
                action = "simplify_chunk"
            
    if action == "switch_to_audio":
        visual_block = content.get("visual", {})
        audio_text = visual_block.get("text", content.get("default", "")) if isinstance(visual_block, dict) else content.get("default", "")
        return _build_payload("audio", "text", "audio", audio_text, intensity)
    elif action in ("switch_to_visual", "visual_mode"):
        visual_payload = content.get("visual", {"text": "", "diagram": ""})
        return _build_payload("visual", "visual", "visual", visual_payload, intensity)
    elif action == "simplify":
        return _build_payload(
            "text",
            "text",
            "simplified",
            content.get("simplified"),
            _clamp(intensity * 0.8, 0, 1),
        )
    elif action == "simplify_chunk" or action == "simplify_chunk_audio" or action == "targeted_simplification":
        return _build_payload(
            "text",
            "text",
            "chunked_simplified",
            content.get("chunked", content.get("simplified")),
            intensity,
        )
    elif action in ("reduce_pace", "chunk"):
        return _build_payload("text", "text", "chunked", content.get("chunked"), intensity)
    elif action in ("increase_pace", "summarize"):
        return _build_payload("text", "text", "summary", content.get("summary"), intensity)
    elif "switch_to_" in action and "," in action:
        # Hybrid modes handler natively combining multiple payload sources safely
        modes = action.replace("switch_to_", "").split(",")
        hybrid_data = {}
        for m in modes:
            mapped_variant = ACTION_VARIANT_MAP.get(f"switch_to_{m}", m)
            hybrid_data[m] = content.get(mapped_variant, "")
        return _build_payload("hybrid", "visual" if "visual" in modes else "text", "hybrid", hybrid_data, intensity)
    
    # "maintain" or any unrecognized fallback triggers the default text view
    return _build_payload("text", "text", "default", content.get("default"), intensity)

def _clamp(n, minn, maxn):
    return max(min(maxn, n), minn)

def transform_content(topic_id: str, decision: dict | str, weak_concepts: list = None):
    """Entry point for the service layer mapping."""
    content_payload = load_content(topic_id)
    if not content_payload:
        return {"error": "topic not found"}
        
    # Ensure backward compatibility with the new { content: {}, quiz: [] } schema
    content = content_payload.get("content", content_payload)
    mapped_content = map_decision_to_content(decision, content, weak_concepts)
    mapped_content["topic"] = content_payload.get("topic", topic_id)
    return mapped_content
