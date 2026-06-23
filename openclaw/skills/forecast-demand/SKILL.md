---
name: forecast-demand
description: Predict whether a topic will matter next week, month or quarter. Use when the Demand Forecast agent must act on its inputs and produce its defined output.
metadata:
  agent: demand-forecast
  source: Project Atlas Requirements §3.1
  layer: L1 Trend
  host: vps
---

# forecast-demand

Predict whether a topic will matter next week, month or quarter.

## When to use
- When the Demand Forecast agent is invoked in the L1 Trend pipeline and its inputs are available.

## Inputs / Sources
Trend Discovery output

## Output
{topic, predicted_growth, confidence}

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — This agent's core work is statistical/deterministic — compute in Python at zero LLM cost; call the model only to interpret a result or resolve ambiguity (spec §11.3).
