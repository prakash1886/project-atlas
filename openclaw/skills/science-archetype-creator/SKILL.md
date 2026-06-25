---
name: science-archetype-creator
description: Focus on sourcing, drafting, and creative selection for: Analyze engagement across thousands of videos to find which archetypes drive retention vs shares vs watch time. Use when the Archetype Scientist Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: archetype-scientist-creator
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-archetype-creator

Focus on sourcing, drafting, and creative selection for: Analyze engagement across thousands of videos to find which archetypes drive retention vs shares vs watch time.

## When to use
- When the Archetype Scientist Creator agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Engagement by archetype

## Output
Draft proposal and creative options for: Archetype performance ranking

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
