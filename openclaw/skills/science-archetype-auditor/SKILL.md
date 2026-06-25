---
name: science-archetype-auditor
description: Focus on fact-checking, safety policies, and final validation for: Analyze engagement across thousands of videos to find which archetypes drive retention vs shares vs watch time. Use when the Archetype Scientist Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: archetype-scientist-auditor
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-archetype-auditor

Focus on fact-checking, safety policies, and final validation for: Analyze engagement across thousands of videos to find which archetypes drive retention vs shares vs watch time.

## When to use
- When the Archetype Scientist Auditor agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Engagement by archetype

## Output
Validated final output: Archetype performance ranking (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
