---
name: optimize-scoring-weights
description: Perform gradient adjustments on the Trend Engine opportunity-scoring weights to align suggested opportunities with actual views and retention growth. Use when DS-Star runs its nightly tuning pass to close the analytics→backlog feedback loop. Pure optimization math — Python, not an LLM (spec §11.3).
metadata:
  agent: ds-star
  source: Project Atlas Agent Skills Manifest §7
  layer: executive-strategy
  production_host: railway
---

# optimize-scoring-weights

Tune the opportunity-scoring weights from realized performance.

## When to use
- Nightly DS-Star pass; after fresh actuals (views, retention, revenue) land.

## Function signature (manifest contract)
```python
def optimize_scoring_weights(actual_vs_predicted: list) -> dict:
    """Gradient-adjust Trend Engine scoring weights to match actual views/retention."""
```

## Inputs / Outputs
- **Input:** `actual_vs_predicted` (list of `{topic, predicted_score, actual_views, actual_retention}`).
- **Output:** `{updated_weights: {...}, delta: {...}, loss}`.

## Feedback loop (spec §8.9 / §9.10)
Apply a `revenue_multiplier` from trailing-90-day `revenue_actuals` per archetype on top of the
engagement score, so archetypes that convert (not just engage) get prioritized.

## Computation-first (spec §11.3)
Gradient/regression is **pure Python** at zero LLM cost. No model call needed for the math.

## Implementation
Call the `hermes-bridge` MCP tool `run_judgment_agent(insight_type="optimize-weights", query=<ask>, context={"actual_vs_predicted": actual_vs_predicted})`. Hits Hermes's `POST /v1/agents/optimize-weights` — note the `insight_type` is `optimize-weights`, not this skill's own name — the same endpoint `runDataScienceInsight('optimize-weights', ...)` calls from the TS `ds-star-scientists` Temporal activities, so this skill and the nightly Temporal pass terminate at the same implementation. No separate backend to wire here.

## Backend dependency
- `backlog_rankings`, `revenue_actuals`, `story_scores` (Railway) feed Hermes's own data pipeline, not this skill directly.
- Production host is **Railway** (spec §11.1), not the VPS.

## Model
None for optimization. (DS-Star's narrative summaries use gemini only when interpreting results.)
