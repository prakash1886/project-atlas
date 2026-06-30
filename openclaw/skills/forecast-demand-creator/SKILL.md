---
name: forecast-demand-creator
description: Focus on sourcing, drafting, and creative selection for: Predict whether a topic will matter next week, month or quarter. Use when the Demand Forecast Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: demand-forecast-creator
  source: Project Atlas Requirements §3.1
  layer: L1 Trend
  host: vps
---

# forecast-demand-creator

Focus on sourcing, drafting, and creative selection for: Predict whether a topic will matter next week, month or quarter.

## When to use
- When the Demand Forecast Creator agent is invoked in the L1 Trend pipeline and its inputs are available.

## Inputs / Sources
Trend Discovery output. Use the `vidiq` MCP server's `vidiq_keyword_research` (volume/competition
trend) and `vidiq_channel_performance_trends` (view trajectory) tools to ground the prediction in
real data rather than estimating from training data alone. vidiq is the prioritized subscription;
fall back to `nexlev` only if vidiq can't answer the lookup.

## Output
Draft proposal and creative options for: {topic, predicted_growth, confidence}

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
