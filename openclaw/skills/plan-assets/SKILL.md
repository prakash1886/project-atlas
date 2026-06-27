---
name: plan-assets
description: Determine B-roll, music, images, and templates; generate Google Veo and Higgsfield AI prompts for visual gaps; construct HeyGen presenter inputs, by calling Hermes's asset-planner judgment agent. Use when the Content Factory agent must produce the asset_planner_output that Hermes's content-run pipeline needs to drive visual/presenter/music/asset-sourcing generation.
metadata:
  agent: content-factory
  source: Project Atlas Requirements §3.5/10.2
  layer: L5 Content Factory
  host: railway
---

# plan-assets

Plan every visual/audio asset the content-run pipeline will need: B-roll, music, images,
Veo/Higgsfield generation prompts, and the HeyGen presenter segment.

## When to use
- After `select-vibe`/`direct-voice`, before dispatching to Hermes's content-run pipeline.

## Inputs / Sources
Script + Vibe + Voice assignment.

## Output
`{broll, music, images, veo_prompts, higgsfield_prompts, heygen_presenter}` (see
`hermes/agents/asset-planner/schema.json`) — exactly the shape `ContentRunRequest.asset_planner_output`
expects (`temporal_workflows.ContentRunWorkflow` reads `veo_prompts`, `higgsfield_prompts`,
`heygen_presenter`, `lyria_prompts`, `broll`, `music`, `images` directly from it).

## Function signature (manifest contract)
```python
def plan_assets(script_text: str, vibe: dict, voice_assignment: dict) -> dict:
    """Returns the asset_planner_output dict Hermes's content-run pipeline consumes."""
```

## Implementation
Call the `hermes-bridge` MCP tool `run_judgment_agent(insight_type="asset-planner", query=<ask>, context={"script_text": script_text, "vibe": vibe, "voice_assignment": voice_assignment})`. Hits `POST /v1/agents/asset-planner` — same self-correcting loop / mock-fallback pattern, no new backend. The Envato/Veo/Higgsfield/HeyGen *calls themselves* still happen deterministically inside Hermes's own production agents (`asset-sourcing`, `visual-generation`, `presenter-generation`) once the content run starts — this skill only produces the *plan*, not the generated assets.

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
