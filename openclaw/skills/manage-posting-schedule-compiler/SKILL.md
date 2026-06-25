---
name: manage-posting-schedule-compiler
description: Focus on structural integrity, schemas, and format alignment for: Enforce consistent cadence across platforms: maintain the publish calendar against §9.4 targets, flag gaps before they break momentum, coordinate Shorts/Reels timing with long-form. Use when the Posting Schedule Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: posting-schedule-compiler
  source: Project Atlas Requirements §9.8
  layer: Growth
  host: vps
---

# manage-posting-schedule-compiler

Focus on structural integrity, schemas, and format alignment for: Enforce consistent cadence across platforms: maintain the publish calendar against §9.4 targets, flag gaps before they break momentum, coordinate Shorts/Reels timing with long-form.

## When to use
- When the Posting Schedule Compiler agent is invoked in the Growth pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Publish calendar + cadence targets

## Output
Compiled and formatted candidate structure for: Schedule + gap alerts

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
