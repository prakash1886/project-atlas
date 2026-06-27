---
name: select-vibe
description: Pick the overall tone/vibe (e.g. motivational, somber, comedic) for a content run from its script and archetype, by calling Hermes's vibe judgment agent. Use when the Content Factory agent must determine the vibe before voice direction and asset planning can proceed.
metadata:
  agent: content-factory
  source: Project Atlas Requirements §3.5/10.2
  layer: L5 Content Factory
  host: railway
---

# select-vibe

Determine the tone/vibe for a content run so downstream voice-direction and asset-planning
have a consistent emotional target.

## When to use
- After `narrative-psychology`'s script is available, before `direct-voice` and `plan-assets` run.

## Inputs / Sources
Script text + archetype/personality context from upstream agents.

## Output
`{vibe, confidence, rationale}` (see `hermes/agents/vibe/schema.json`).

## Function signature (manifest contract)
```python
def select_vibe(script_text: str, archetype_context: dict) -> dict:
    """Returns {"vibe": str, "confidence": float, "rationale": str}."""
```

## Implementation
Call the `hermes-bridge` MCP tool `run_judgment_agent(insight_type="vibe", query=<script summary + ask>, context=archetype_context)`. This hits Hermes's `POST /v1/agents/vibe`, which already runs a self-correcting LLM judgment loop against `hermes/agents/vibe/soul.txt` + `schema.json` (falls back to a structured mock response if Hermes's AIAgent dependency isn't configured) — no separate backend wiring needed here.

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3).
