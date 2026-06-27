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
Call the `hermes-bridge` MCP tool `run_judgment_agent(insight_type="forecast-retention", query=<ask>, context={"video_id": video_id})`. Hits Hermes's `POST /v1/agents/forecast-retention` — the same endpoint `runDataScienceInsight('forecast-retention', ...)` calls from the TS `ds-star-scientists` Temporal activities, so this skill and the nightly/weekly Temporal workflows terminate at the same implementation. No separate backend to wire here.

## Backend dependency
- YouTube Analytics API + `story_scores`/retention tables (Railway) feed Hermes's own data pipeline, not this skill directly.
- Production host is **Railway** (colocated with the graph/vector store, spec §11.1), not the VPS.

## Model
Mostly none (Python). Optional interpretation: gemini-direct/gemini-2.5-flash on flagged exceptions only.
