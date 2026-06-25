---
name: extract-human-meaning-compiler
description: Focus on structural integrity, schemas, and format alignment for: Answer why people cared, what need was satisfied, what lesson exists today — turning facts into psychology/leadership/identity content. Use when the Human Meaning Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: human-meaning-compiler
  source: Project Atlas Requirements §3.3
  layer: L3 Story
  host: vps
---

# extract-human-meaning-compiler

Focus on structural integrity, schemas, and format alignment for: Answer why people cared, what need was satisfied, what lesson exists today — turning facts into psychology/leadership/identity content.

## When to use
- When the Human Meaning Compiler agent is invoked in the L3 Story pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Arc + Cultural Context

## Output
Compiled and formatted candidate structure for: Meaning narrative

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
