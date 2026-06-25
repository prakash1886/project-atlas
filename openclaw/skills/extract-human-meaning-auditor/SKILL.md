---
name: extract-human-meaning-auditor
description: Focus on fact-checking, safety policies, and final validation for: Answer why people cared, what need was satisfied, what lesson exists today — turning facts into psychology/leadership/identity content. Use when the Human Meaning Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: human-meaning-auditor
  source: Project Atlas Requirements §3.3
  layer: L3 Story
  host: vps
---

# extract-human-meaning-auditor

Focus on fact-checking, safety policies, and final validation for: Answer why people cared, what need was satisfied, what lesson exists today — turning facts into psychology/leadership/identity content.

## When to use
- When the Human Meaning Auditor agent is invoked in the L3 Story pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Arc + Cultural Context

## Output
Validated final output: Meaning narrative (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
