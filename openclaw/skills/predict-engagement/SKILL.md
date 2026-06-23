---
name: predict-engagement
description: Predict CTR, watch time, comments and shares before production. Use when the Engagement Prediction agent must act on its inputs and produce its defined output.
metadata:
  agent: engagement-prediction
  source: Project Atlas Requirements §3.4
  layer: L4 Audience
  host: vps
---

# predict-engagement

Predict CTR, watch time, comments and shares before production.

## When to use
- When the Engagement Prediction agent is invoked in the L4 Audience pipeline and its inputs are available.

## Inputs / Sources
Historical performance + story metadata

## Output
Predicted engagement metrics

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — This agent's core work is statistical/deterministic — compute in Python at zero LLM cost; call the model only to interpret a result or resolve ambiguity (spec §11.3).
