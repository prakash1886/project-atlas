---
name: discover-personalities
description: Find athletes, leaders, entrepreneurs, philosophers, scientists, reformers, commanders across categories. Use when the Personality Discovery agent must act on its inputs and produce its defined output.
metadata:
  agent: personality-discovery
  source: Project Atlas Requirements §3.2
  layer: L2 Personality
  host: vps
---

# discover-personalities

Find athletes, leaders, entrepreneurs, philosophers, scientists, reformers, commanders across categories.

## When to use
- When the Personality Discovery agent is invoked in the L2 Personality pipeline and its inputs are available.

## Inputs / Sources
Trend + Coverage data

## Output
Personality candidate list

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
