---
name: forecast-demand-compiler
description: Focus on structural integrity, schemas, and format alignment for: Predict whether a topic will matter next week, month or quarter. Use when the Demand Forecast Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: demand-forecast-compiler
  source: Project Atlas Requirements §3.1
  layer: L1 Trend
  host: vps
---

# forecast-demand-compiler

Focus on structural integrity, schemas, and format alignment for: Predict whether a topic will matter next week, month or quarter.

## When to use
- When the Demand Forecast Compiler agent is invoked in the L1 Trend pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Trend Discovery output

## Output
Compiled and formatted candidate structure for: {topic, predicted_growth, confidence}

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
