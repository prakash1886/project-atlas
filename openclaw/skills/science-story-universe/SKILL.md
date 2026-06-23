---
name: science-story-universe
description: Compare retention across story types within one personality's universe (e.g. failure stories vs product-launch stories) to direct future production. Use when the Story Universe Scientist agent must act on its inputs and produce its defined output.
metadata:
  agent: story-universe-scientist
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-story-universe

Compare retention across story types within one personality's universe (e.g. failure stories vs product-launch stories) to direct future production.

## When to use
- When the Story Universe Scientist agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Per-personality retention by story type

## Output
Story-type ranking per personality

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — This agent's core work is statistical/deterministic — compute in Python at zero LLM cost; call the model only to interpret a result or resolve ambiguity (spec §11.3).
