---
name: drive-community-engagement-compiler
description: Focus on structural integrity, schemas, and format alignment for: Drive comment-stage engagement signals: draft and schedule timely replies to early comments, surface high-signal questions to Coverage Gap, monitor comment sentiment for safety flags. Use when the Community Engagement Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: community-engagement-compiler
  source: Project Atlas Requirements §9.8
  layer: Growth
  host: vps
---

# drive-community-engagement-compiler

Focus on structural integrity, schemas, and format alignment for: Drive comment-stage engagement signals: draft and schedule timely replies to early comments, surface high-signal questions to Coverage Gap, monitor comment sentiment for safety flags.

## When to use
- When the Community Engagement Compiler agent is invoked in the Growth pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Comments + sentiment

## Output
Compiled and formatted candidate structure for: Reply drafts + surfaced topics

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
