---
name: generate-thumbnails
description: Draft thumbnail concepts (prompt, focal emotion, text overlay) for a content run by calling Hermes's thumbnail judgment agent. Use when the Content Factory agent must produce the thumbnail_concepts that Hermes's content-run pipeline needs to render actual thumbnail images via thumbnail-generation.
metadata:
  agent: content-factory
  source: Project Atlas Requirements §3.5/10.2
  layer: L5 Content Factory
  host: railway
---

# generate-thumbnails

Draft thumbnail *concepts* (text descriptions, not images) for a content run.

## When to use
- Alongside `plan-assets`, before dispatching to Hermes's content-run pipeline.

## Inputs / Sources
Script + Vibe + archetype context.

## Output
`{concepts: [{prompt, focal_emotion, text_overlay}]}` (see `hermes/agents/thumbnail/schema.json`) —
the `concepts` list is exactly the shape `ContentRunRequest.thumbnail_concepts` expects;
Hermes's `thumbnail-generation` production agent turns each concept into an actual Higgsfield
image once the content run starts (see `hermes/agents/thumbnail-generation/executor.py`).

## Function signature (manifest contract)
```python
def generate_thumbnail_concepts(script_text: str, vibe: dict, archetype_context: dict) -> dict:
    """Returns {"concepts": [{"prompt": str, "focal_emotion": str, "text_overlay": str}, ...]}."""
```

## Implementation
Call the `hermes-bridge` MCP tool `run_judgment_agent(insight_type="thumbnail", query=<ask>, context={"script_text": script_text, "vibe": vibe, **archetype_context})`. Hits `POST /v1/agents/thumbnail` — same self-correcting loop / mock-fallback pattern, no new backend. The actual image generation (Higgsfield) happens later, deterministically, inside Hermes's `thumbnail-generation` production agent.

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3).
