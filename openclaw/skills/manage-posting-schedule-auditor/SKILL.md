---
name: manage-posting-schedule-auditor
description: Focus on fact-checking, safety policies, and final validation for: Enforce consistent cadence across platforms: maintain the publish calendar against §9.4 targets, flag gaps before they break momentum, coordinate Shorts/Reels timing with long-form. Use when the Posting Schedule Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: posting-schedule-auditor
  source: Project Atlas Requirements §9.8
  layer: Growth
  host: vps
---

# manage-posting-schedule-auditor

Focus on fact-checking, safety policies, and final validation for: Enforce consistent cadence across platforms: maintain the publish calendar against §9.4 targets, flag gaps before they break momentum, coordinate Shorts/Reels timing with long-form.

## When to use
- When the Posting Schedule Auditor agent is invoked in the Growth pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Publish calendar + cadence targets

## Output
Validated final output: Schedule + gap alerts (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
