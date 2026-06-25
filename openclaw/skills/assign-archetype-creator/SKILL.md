---
name: assign-archetype-creator
description: Focus on sourcing, drafting, and creative selection for: Map personalities to archetypes: rebel, warrior, builder, visionary, teacher, strategist, underdog, survivor. Use when the Archetype Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: archetype-creator
  source: Project Atlas Requirements §3.3
  layer: L3 Story
  host: vps
---

# assign-archetype-creator

Focus on sourcing, drafting, and creative selection for: Map personalities to archetypes: rebel, warrior, builder, visionary, teacher, strategist, underdog, survivor.

## When to use
- When the Archetype Creator agent is invoked in the L3 Story pipeline and its inputs are available.

## Inputs / Sources
Psychological Arc

## Output
Draft proposal and creative options for: Archetype tags

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
