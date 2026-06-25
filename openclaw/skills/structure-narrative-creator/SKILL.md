---
name: structure-narrative-creator
description: Focus on sourcing, drafting, and creative selection for: Structure script as Hook → Conflict → Escalation → Resolution → Lesson. Use when the Narrative Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: narrative-creator
  source: Project Atlas Requirements §3.5
  layer: L5 Content Factory
  host: vps
---

# structure-narrative-creator

Focus on sourcing, drafting, and creative selection for: Structure script as Hook → Conflict → Escalation → Resolution → Lesson.

## When to use
- When the Narrative Creator agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
Story + Psychological Arc

## Output
Draft proposal and creative options for: Narrative outline

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
