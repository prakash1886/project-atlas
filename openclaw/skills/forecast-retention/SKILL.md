---
name: forecast-retention
description: Parse YouTube retention-curve coordinates to predict audience drop-off hotspots for a video. Use when DS-Star must forecast where viewers will leave so the Narrative/Retention agents can fix pacing before upload. This is statistical work — compute in Python/pandas, call the model only to interpret (spec §11.3 computation-first).
metadata:
  agent: ds-star
  source: Project Atlas Agent Skills Manifest §7
  layer: executive-strategy
  production_host: railway
---

# forecast-retention

Predict drop-off hotspots from retention data.

## When to use
- A video has analytics (or a draft has a comparable-cohort baseline) and you need drop-off risk.

## Function signature (manifest contract)
```python
def forecast_retention(video_id: str) -> dict:
    """Parse retention-curve coordinates; predict audience drop-off hotspots."""
```

## Inputs / Outputs
- **Input:** `video_id`.
- **Output:** `{predicted_curve: [...], hotspots: [{timestamp_s, severity}], confidence}`.

## Computation-first (spec §11.3)
Curve parsing, smoothing, and hotspot detection are **pure pandas** at zero LLM cost. The model
is only used to write a one-line interpretation of a flagged hotspot — and only when something
unusual is found.

## Implementation
Call the `hermes-bridge` MCP tool `run_judgment_agent(insight_type="retention", query=<ask>, context={"video_id": video_id})`. Hits Hermes's `POST /v1/agents/retention` (the real directory is `hermes/agents/retention/`, not `forecast-retention` -- using this skill's own name as the insight_type previously missed it and silently fell back to an empty/generic response). Note: the TS `ds-star-scientists` Temporal activities (`server/src/modules/temporal/activities/ds-star-scientists.activities.ts`) don't currently call a `forecast-retention`/`retention` scientist at all -- only 8 others are wired there -- so this fix only affects this OpenClaw skill's own path, not a parallel Temporal one.

## Backend dependency
- YouTube Analytics API + `story_scores`/retention tables (Railway) feed Hermes's own data pipeline, not this skill directly.
- Production host is **Railway** (colocated with the graph/vector store, spec §11.1), not the VPS.

## Model
Mostly none (Python). Optional interpretation: gemini-direct/gemini-2.5-flash on flagged exceptions only.
