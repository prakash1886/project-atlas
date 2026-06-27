---
name: direct-voice
description: Choose the narration voice, pace, energy, and emotion for a content run from its vibe and script, by calling Hermes's voice-director judgment agent. Use when the Content Factory agent must produce the voice_assignment that Hermes's content-run pipeline needs for narration synthesis.
metadata:
  agent: content-factory
  source: Project Atlas Requirements §3.5/10.2
  layer: L5 Content Factory
  host: railway
---

# direct-voice

Pick the ElevenLabs voice_id, pace, energy, and emotion matching the run's vibe and archetype.

## When to use
- After `select-vibe` has produced a vibe, before the content-run pipeline's narration-synthesis stage.

## Inputs / Sources
Vibe output + script text + archetype context.

## Output
`{voice_id, pace, energy, emotion, rationale}` (see `hermes/agents/voice-director/schema.json`) —
this is exactly the shape `ContentRunRequest.voice_assignment` expects (`voice_id`, `energy`
are read directly by `orchestrator`/`temporal_workflows.ContentRunWorkflow`).

## Function signature (manifest contract)
```python
def direct_voice(vibe: dict, script_text: str, archetype_context: dict) -> dict:
    """Returns {"voice_id": str, "pace": str, "energy": str, "emotion": str, "rationale": str}."""
```

## Implementation
Call the `hermes-bridge` MCP tool `run_judgment_agent(insight_type="voice-director", query=<ask>, context={"vibe": vibe, "script_text": script_text, **archetype_context})`. Hits `POST /v1/agents/voice-director` — same self-correcting loop / mock-fallback pattern as `select-vibe`, no new backend.

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3).
