---
name: predict-engagement-compiler
description: Focus on structural integrity, schemas, and format alignment for: Predict CTR, watch time, comments and shares before production. Use when the Engagement Prediction Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: engagement-prediction-compiler
  source: Project Atlas Requirements §3.4
  layer: L4 Audience
  host: vps
---

# predict-engagement-compiler

Focus on structural integrity, schemas, and format alignment for: Predict CTR, watch time, comments and shares before production.

## When to use
- When the Engagement Prediction Compiler agent is invoked in the L4 Audience pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Historical performance + story metadata

## Output
Compiled and formatted candidate structure for: Predicted engagement metrics

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
