---
name: extract-human-meaning-creator
description: Focus on sourcing, drafting, and creative selection for: Answer why people cared, what need was satisfied, what lesson exists today — turning facts into psychology/leadership/identity content. Use when the Human Meaning Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: human-meaning-creator
  source: Project Atlas Requirements §3.3
  layer: L3 Story
  host: vps
---

# extract-human-meaning-creator

Focus on sourcing, drafting, and creative selection for: Answer why people cared, what need was satisfied, what lesson exists today — turning facts into psychology/leadership/identity content.

## When to use
- When the Human Meaning Creator agent is invoked in the L3 Story pipeline and its inputs are available.

## Inputs / Sources
Arc + Cultural Context. Use the `vidiq` MCP server's `vidiq_video_watch` tool on existing top
videos about this personality to see what meaning/lesson other creators have already drawn out,
avoiding a redundant angle. vidiq is the prioritized subscription; fall back to `nexlev` only if
vidiq can't answer the lookup.

## Output
Draft proposal and creative options for: Meaning narrative

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
