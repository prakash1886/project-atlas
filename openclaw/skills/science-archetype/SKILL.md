---
name: science-archetype
description: Analyze engagement across thousands of videos to find which archetypes drive retention vs shares vs watch time. Use when the Archetype Scientist agent must act on its inputs and produce its defined output.
metadata:
  agent: archetype-scientist
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-archetype

Analyze engagement across thousands of videos to find which archetypes drive retention vs shares vs watch time.

## When to use
- When the Archetype Scientist agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Engagement by archetype

## Output
Archetype performance ranking

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — This agent's core work is statistical/deterministic — compute in Python at zero LLM cost; call the model only to interpret a result or resolve ambiguity (spec §11.3).
