---
name: science-youtube-auditor
description: Focus on fact-checking, safety policies, and final validation for: Analyze CTR, watch time, retention, comments, likes and shares to find production-format insights (video length, best posting times by topic). Use when the YouTube Scientist Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: youtube-scientist-auditor
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-youtube-auditor

Focus on fact-checking, safety policies, and final validation for: Analyze CTR, watch time, retention, comments, likes and shares to find production-format insights (video length, best posting times by topic).

## When to use
- When the YouTube Scientist Auditor agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: YouTube analytics

## Output
Validated final output: Format/timing insights (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
