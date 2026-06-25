---
name: science-backlog-compiler
description: Focus on structural integrity, schemas, and format alignment for: Rank all personalities and story opportunities into create-now / create-later / archive, applying a trailing-90-day revenue multiplier per archetype (spec §8.9). Use when the Backlog Scientist Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: backlog-scientist-compiler
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-backlog-compiler

Focus on structural integrity, schemas, and format alignment for: Rank all personalities and story opportunities into create-now / create-later / archive, applying a trailing-90-day revenue multiplier per archetype (spec §8.9).

## When to use
- When the Backlog Scientist Compiler agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: All scores + revenue_actuals

## Output
Compiled and formatted candidate structure for: backlog_rankings

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
