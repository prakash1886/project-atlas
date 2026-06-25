---
name: assign-archetype-compiler
description: Focus on structural integrity, schemas, and format alignment for: Map personalities to archetypes: rebel, warrior, builder, visionary, teacher, strategist, underdog, survivor. Use when the Archetype Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: archetype-compiler
  source: Project Atlas Requirements §3.3
  layer: L3 Story
  host: vps
---

# assign-archetype-compiler

Focus on structural integrity, schemas, and format alignment for: Map personalities to archetypes: rebel, warrior, builder, visionary, teacher, strategist, underdog, survivor.

## When to use
- When the Archetype Compiler agent is invoked in the L3 Story pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Psychological Arc

## Output
Compiled and formatted candidate structure for: Archetype tags

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
