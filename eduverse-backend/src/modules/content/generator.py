import json
import httpx

OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma4:31b-cloud"

def safe_parse_json(response_text: str):
    """Safely extract and parse JSON from potentially messy LLM output."""
    try:
        return json.loads(response_text)
    except Exception:
        # attempt to extract JSON block
        start = response_text.find("{")
        end = response_text.rfind("}")
        if start != -1 and end != -1:
            try:
                return json.loads(response_text[start:end+1])
            except:
                return None
    return None

def normalize_concept(text: str) -> str:
    """Normalize concept strings to ensure graph compatibility."""
    return str(text).lower().replace(" ", "_")

def validate_content_structure(data) -> bool:
    """Strict validation layer to protect the deterministic engine."""
    if not data or "content" not in data:
        return False

    c = data["content"]
    required = ["default", "simplified", "chunked", "summary", "visual"]

    for key in required:
        if key not in c:
            return False

    if not isinstance(c["default"], dict) or not c["default"].get("text"):
        return False

    if not isinstance(c["chunked"], dict) or not isinstance(c["chunked"].get("content"), list):
        return False

    if "quiz" not in data or not isinstance(data["quiz"], list) or len(data["quiz"]) < 1:
        return False

    return True

def generate_topic_content(topic: str) -> dict:
    """
    Generates structured topic content using local Ollama API (Gemma).
    Enforces strict JSON schema constraints.
    """
    prompt = f"""You must return ONLY valid JSON. Do not include any explanation.

Output EXACTLY in this structure:

{{
  "topic": "{topic}",
  "content": {{
    "default": {{ "text": "1000 character explanation" }},
    "simplified": {{ "text": "simplified explanation" }},
    "chunked": {{ "content": ["...", "..."] }},
    "summary": {{ "text": "short summary" }},
    "visual": {{ "text": "...", "diagram": "..." }}
  }},
  "concepts": {{
    "concept_name": {{
      "simplified": "...",
      "chunked": ["..."]
    }}
  }},
  "quiz": [
    {{
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct": "...",
      "concept": "..."
    }}
  ]
}}

Rules:
- No markdown
- No explanation
- No extra text
- Ensure valid JSON
- You MUST provide exactly 3 quiz questions in the array.
"""

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }

    with httpx.Client(timeout=120.0) as client:
        try:
            response = client.post(OLLAMA_API_URL, json=payload)
            response.raise_for_status()
            
            result = response.json()
            generated_text = result.get("response", "")
            
            dataset = safe_parse_json(generated_text)
            if not dataset:
                raise ValueError("Failed to parse JSON from LLM response.")
                
            if not validate_content_structure(dataset):
                print(f"INVALID DATASET GENERATED: {json.dumps(dataset, indent=2)}")
                raise ValueError("LLM generated invalid content structure.")
                
            # Normalize concepts
            if "concepts" in dataset:
                normalized_concepts = {}
                for k, v in dataset["concepts"].items():
                    normalized_concepts[normalize_concept(k)] = v
                dataset["concepts"] = normalized_concepts
                
            if "quiz" in dataset:
                for q in dataset["quiz"]:
                    if "concept" in q:
                        q["concept"] = normalize_concept(q["concept"])
                        
            # Map back to the system's flat deterministic format
            c = dataset["content"]
            flat_content = {
                "default": c["default"].get("text", ""),
                "simplified": c["simplified"].get("text", "") if isinstance(c.get("simplified"), dict) else "",
                "chunked": c["chunked"].get("content", []) if isinstance(c.get("chunked"), dict) else [],
                "summary": c["summary"].get("text", "") if isinstance(c.get("summary"), dict) else "",
                "visual": c["visual"],
                "concepts": dataset.get("concepts", {})
            }
            dataset["content"] = flat_content
            # Remove root concepts as it's now inside content
            if "concepts" in dataset:
                del dataset["concepts"]
                
            dataset["is_ai_generated"] = True
            return dataset
            
        except httpx.HTTPError as e:
            raise RuntimeError(f"Failed to communicate with Ollama: {e}")
        except Exception as e:
            raise RuntimeError(f"An error occurred during generation: {e}")
