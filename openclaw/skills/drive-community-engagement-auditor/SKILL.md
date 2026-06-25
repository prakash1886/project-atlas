---
name: drive-community-engagement-auditor
description: Focus on fact-checking, safety policies, and final validation for: Drive comment-stage engagement signals: draft and schedule timely replies to early comments, surface high-signal questions to Coverage Gap, monitor comment sentiment for safety flags. Use when the Community Engagement Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: community-engagement-auditor
  source: Project Atlas Requirements §9.8
  layer: Growth
  host: vps
---

# drive-community-engagement-auditor

Focus on fact-checking, safety policies, and final validation for: Drive comment-stage engagement signals: draft and schedule timely replies to early comments, surface high-signal questions to Coverage Gap, monitor comment sentiment for safety flags.

## When to use
- When the Community Engagement Auditor agent is invoked in the Growth pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Comments + sentiment

## Output
Validated final output: Reply drafts + surfaced topics (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
