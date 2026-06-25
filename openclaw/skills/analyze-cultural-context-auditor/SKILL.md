---
name: analyze-cultural-context-auditor
description: Focus on fact-checking, safety policies, and final validation for: Determine why this person mattered at that specific moment in history/society. Use when the Cultural Context Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: cultural-context-auditor
  source: Project Atlas Requirements §3.3
  layer: L3 Story
  host: vps
---

# analyze-cultural-context-auditor

Focus on fact-checking, safety policies, and final validation for: Determine why this person mattered at that specific moment in history/society.

## When to use
- When the Cultural Context Auditor agent is invoked in the L3 Story pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: News, GDELT, cultural analysis sources

## Output
Validated final output: Context narrative (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
