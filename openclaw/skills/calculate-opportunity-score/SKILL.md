---
name: calculate-opportunity-score
description: Compute the Project Atlas weighted opportunity score for a topic from raw metrics (search, discussion, video, evergreen, emotional, competition, monetization, regional). Use when the Trend Intelligence agent must rank or classify a topic after signals are fetched. This is arithmetic — compute in Python, not via an LLM (spec §11.3 computation-first).
metadata:
  agent: trend-intelligence
  source: Project Atlas Agent Skills Manifest §2
  layer: L1-trend
---

# calculate-opportunity-score

Turn raw metrics into a single ranked opportunity score + classification.

## Formula (manifest §2)
```
Score = Search(20%) + Discussion(15%) + Video(15%) + Evergreen(15%)
      + Emotional(10%) + Competition(10%) + Monetization(10%) + Regional(5%)
```

## When to use
- After `fetch-signals` returns metrics for a topic.
- Backlog ranking / create-now vs create-later classification.

## Function signature (manifest contract)
```python
def calculate_opportunity_score(raw_metrics: dict) -> dict:
    """Returns {"topic": str, "final_score": int, "classification": str}."""
```

## Inputs / Outputs
- **Input:** `raw_metrics` dict with the eight weighted components (0–100 each).
- **Output:** `{topic, final_score, classification}`.

## Computation-first (spec §11.3)
This is a deterministic weighted sum — run it in Python at **zero LLM cost**. Only call the
model to write the one-line plain-language `reason` for a ranked item, not to compute the score.

## Implementation
Call the `temporal-bridge` MCP tool `start_workflow("calculateOpportunityScoreWorkflow", "trend-signals", [raw_metrics])`, then poll `get_workflow_result(workflow_id)`. Runs the weighted-sum formula above as a new `calculateOpportunityScore` Temporal activity (`server/src/modules/temporal/activities/trend-signals.activities.ts`) -- pure TypeScript arithmetic, zero LLM cost, matching this skill's own computation-first requirement.

## Backend dependency
- Writes `content_opportunities` / `story_scores` (Railway). **Stubbed** until wired -- the scoring call itself works today, it just isn't durably stored yet.

## Model
No LLM needed for the score. Optional one-line reason: deepseek-direct/deepseek-chat.
