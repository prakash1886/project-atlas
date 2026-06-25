---
name: science-archetype-compiler
description: Focus on structural integrity, schemas, and format alignment for: Analyze engagement across thousands of videos to find which archetypes drive retention vs shares vs watch time. Use when the Archetype Scientist Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: archetype-scientist-compiler
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-archetype-compiler

Focus on structural integrity, schemas, and format alignment for: Analyze engagement across thousands of videos to find which archetypes drive retention vs shares vs watch time.

## When to use
- When the Archetype Scientist Compiler agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Engagement by archetype

## Output
Compiled and formatted candidate structure for: Archetype performance ranking

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
