---
name: extract-psychological-arc-creator
description: Focus on sourcing, drafting, and creative selection for: Extract identity, struggle, failure, growth, leadership, resilience, reinvention, legacy. Use when the Psychological Arc Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: psychological-arc-creator
  source: Project Atlas Requirements §3.3
  layer: L3 Story
  host: vps
---

# extract-psychological-arc-creator

Focus on sourcing, drafting, and creative selection for: Extract identity, struggle, failure, growth, leadership, resilience, reinvention, legacy.

## When to use
- When the Psychological Arc Creator agent is invoked in the L3 Story pipeline and its inputs are available.

## Inputs / Sources
Biographies, interviews (via Exa)

## Output
Draft proposal and creative options for: psychological_arcs record

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
