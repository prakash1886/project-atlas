---
name: predict-engagement-creator
description: Focus on sourcing, drafting, and creative selection for: Predict CTR, watch time, comments and shares before production. Use when the Engagement Prediction Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: engagement-prediction-creator
  source: Project Atlas Requirements §3.4
  layer: L4 Audience
  host: vps
---

# predict-engagement-creator

Focus on sourcing, drafting, and creative selection for: Predict CTR, watch time, comments and shares before production.

## When to use
- When the Engagement Prediction Creator agent is invoked in the L4 Audience pipeline and its inputs are available.

## Inputs / Sources
Historical performance + story metadata

## Output
Draft proposal and creative options for: Predicted engagement metrics

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
