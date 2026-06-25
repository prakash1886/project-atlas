---
name: analyze-cultural-context-compiler
description: Focus on structural integrity, schemas, and format alignment for: Determine why this person mattered at that specific moment in history/society. Use when the Cultural Context Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: cultural-context-compiler
  source: Project Atlas Requirements §3.3
  layer: L3 Story
  host: vps
---

# analyze-cultural-context-compiler

Focus on structural integrity, schemas, and format alignment for: Determine why this person mattered at that specific moment in history/society.

## When to use
- When the Cultural Context Compiler agent is invoked in the L3 Story pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: News, GDELT, cultural analysis sources

## Output
Compiled and formatted candidate structure for: Context narrative

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
