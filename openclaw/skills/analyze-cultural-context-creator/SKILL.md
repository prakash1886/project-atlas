---
name: analyze-cultural-context-creator
description: Focus on sourcing, drafting, and creative selection for: Determine why this person mattered at that specific moment in history/society. Use when the Cultural Context Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: cultural-context-creator
  source: Project Atlas Requirements §3.3
  layer: L3 Story
  host: vps
---

# analyze-cultural-context-creator

Focus on sourcing, drafting, and creative selection for: Determine why this person mattered at that specific moment in history/society.

## When to use
- When the Cultural Context Creator agent is invoked in the L3 Story pipeline and its inputs are available.

## Inputs / Sources
News, GDELT, cultural analysis sources. Use the `vidiq` MCP server's `vidiq_video_watch` tool on
existing top videos about this personality to see how other creators have already framed their
cultural significance, avoiding a redundant angle. vidiq is the prioritized subscription; fall
back to `nexlev` only if vidiq can't answer the lookup.

## Output
Draft proposal and creative options for: Context narrative

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
