---
name: score-geography
description: Calculate India / US / Europe / Australia relevance scores. Use when the Geographic Intelligence agent must act on its inputs and produce its defined output.
metadata:
  agent: geographic-intelligence
  source: Project Atlas Requirements §3.4
  layer: L4 Audience
  host: vps
---

# score-geography

Calculate India / US / Europe / Australia relevance scores.

## When to use
- When the Geographic Intelligence agent is invoked in the L4 Audience pipeline and its inputs are available.

## Inputs / Sources
Trend + audience data

## Output
{india, usa, europe, australia} scores

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — This agent's core work is statistical/deterministic — compute in Python at zero LLM cost; call the model only to interpret a result or resolve ambiguity (spec §11.3).
