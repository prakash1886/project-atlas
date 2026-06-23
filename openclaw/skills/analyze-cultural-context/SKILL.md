---
name: analyze-cultural-context
description: Determine why this person mattered at that specific moment in history/society. Use when the Cultural Context agent must act on its inputs and produce its defined output.
metadata:
  agent: cultural-context
  source: Project Atlas Requirements §3.3
  layer: L3 Story
  host: vps
---

# analyze-cultural-context

Determine why this person mattered at that specific moment in history/society.

## When to use
- When the Cultural Context agent is invoked in the L3 Story pipeline and its inputs are available.

## Inputs / Sources
News, GDELT, cultural analysis sources

## Output
Context narrative

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
