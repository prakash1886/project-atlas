---
name: science-backlog
description: Rank all personalities and story opportunities into create-now / create-later / archive, applying a trailing-90-day revenue multiplier per archetype (spec §8.9). Use when the Backlog Scientist agent must act on its inputs and produce its defined output.
metadata:
  agent: backlog-scientist
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-backlog

Rank all personalities and story opportunities into create-now / create-later / archive, applying a trailing-90-day revenue multiplier per archetype (spec §8.9).

## When to use
- When the Backlog Scientist agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
All scores + revenue_actuals

## Output
backlog_rankings

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — This agent's core work is statistical/deterministic — compute in Python at zero LLM cost; call the model only to interpret a result or resolve ambiguity (spec §11.3).
