---
name: generate-script-auditor
description: Focus on fact-checking, safety policies, and final validation for: Generate shorts, reels, long-form video, podcast and blog scripts. Use when the Script Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: script-auditor
  source: Project Atlas Requirements §3.5
  layer: L5 Content Factory
  host: modal
---

# generate-script-auditor

Focus on fact-checking, safety policies, and final validation for: Generate shorts, reels, long-form video, podcast and blog scripts.

## When to use
- When the Script Auditor agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Narrative outline

## Output
Validated final output: Final script text (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
