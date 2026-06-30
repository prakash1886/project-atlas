---
name: optimize-scoring-weights
description: Perform gradient adjustments on the Trend Engine opportunity-scoring weights to align suggested opportunities with actual views and retention growth. Use when DS-Star runs its nightly tuning pass to close the analytics→backlog feedback loop.
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
- **Input:** `actual_vs_predicted` (list of `{topic, predicted_score, actual_views, actual_retention}`),
  if available -- `revenue_actuals`/`story_scores` (Railway) are still stubbed pending the
  Postgres/AGE backbone, so this often won't be populated yet.
- **Output:** `{generated_at, optimized_weights: {search, discussion, video, evergreen, emotion,
  competition, monetization, regional}, learning_rate, status, used_stub_data}` (see
  `hermes/agents/optimize-weights/schema.json`).

## Feedback loop (spec §8.9 / §9.10)
Apply a `revenue_multiplier` from trailing-90-day `revenue_actuals` per archetype on top of the
engagement score, so archetypes that convert (not just engage) get prioritized.

## VidIQ stopgap (own-channel actuals)
Until `revenue_actuals`/`story_scores` are wired, the underlying agent checks `vidiq_user_channels`
for a connected channel and uses `vidiq_channel_analytics` against it for real `actual_vs_predicted`
figures when one exists. If no channel is connected yet, it proceeds on whatever
`actual_vs_predicted` was passed in this skill's own input and marks `used_stub_data: true` in
the output -- check that field before trusting a run's weights as grounded in real data.

## Implementation
Call the `hermes-bridge` MCP tool `run_judgment_agent(insight_type="optimize-weights", query=<ask>, context={"actual_vs_predicted": actual_vs_predicted})`. Hits Hermes's `POST /v1/agents/optimize-weights` (`hermes/agents/optimize-weights/`) — note the `insight_type` is `optimize-weights`, not this skill's own name. This is the standard LLM judgment-loop path (`execute_self_improving_hermes_agent`), not a separate pure-Python implementation -- no such implementation exists in this repo today. The TS `ds-star-scientists` Temporal activities (`server/src/modules/temporal/activities/ds-star-scientists.activities.ts`) don't currently call an `optimize-weights` scientist at all, so this skill is the only path that reaches it.

## Backend dependency
- `backlog_rankings`, `revenue_actuals`, `story_scores` (Railway) feed Hermes's own data pipeline, not this skill directly -- still stubbed; VidIQ own-channel data is the stopgap until then (see above).
- Production host is **Railway** (spec §11.1), not the VPS.

## Model
Runs as a standard Hermes judgment-loop agent (see Implementation) -- not zero-LLM despite earlier documentation here claiming otherwise.
