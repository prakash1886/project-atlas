---
name: drive-community-engagement-creator
description: Focus on sourcing, drafting, and creative selection for: Drive comment-stage engagement signals: draft and schedule timely replies to early comments, surface high-signal questions to Coverage Gap, monitor comment sentiment for safety flags. Use when the Community Engagement Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: community-engagement-creator
  source: Project Atlas Requirements §9.8
  layer: Growth
  host: vps
---

# drive-community-engagement-creator

Focus on sourcing, drafting, and creative selection for: Drive comment-stage engagement signals: draft and schedule timely replies to early comments, surface high-signal questions to Coverage Gap, monitor comment sentiment for safety flags.

## When to use
- When the Community Engagement Creator agent is invoked in the Growth pipeline and its inputs are available.

## Inputs / Sources
Comments + sentiment

## Output
Draft proposal and creative options for: Reply drafts + surfaced topics

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
