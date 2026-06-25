---
name: science-story-universe-auditor
description: Focus on fact-checking, safety policies, and final validation for: Compare retention across story types within one personality's universe (e.g. failure stories vs product-launch stories) to direct future production. Use when the Story Universe Scientist Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: story-universe-scientist-auditor
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-story-universe-auditor

Focus on fact-checking, safety policies, and final validation for: Compare retention across story types within one personality's universe (e.g. failure stories vs product-launch stories) to direct future production.

## When to use
- When the Story Universe Scientist Auditor agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Per-personality retention by story type

## Output
Validated final output: Story-type ranking per personality (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
