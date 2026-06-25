---
name: assign-archetype-auditor
description: Focus on fact-checking, safety policies, and final validation for: Map personalities to archetypes: rebel, warrior, builder, visionary, teacher, strategist, underdog, survivor. Use when the Archetype Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: archetype-auditor
  source: Project Atlas Requirements §3.3
  layer: L3 Story
  host: vps
---

# assign-archetype-auditor

Focus on fact-checking, safety policies, and final validation for: Map personalities to archetypes: rebel, warrior, builder, visionary, teacher, strategist, underdog, survivor.

## When to use
- When the Archetype Auditor agent is invoked in the L3 Story pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Psychological Arc

## Output
Validated final output: Archetype tags (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
