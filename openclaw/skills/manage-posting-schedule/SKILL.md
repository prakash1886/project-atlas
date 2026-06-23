---
name: manage-posting-schedule
description: Enforce consistent cadence across platforms: maintain the publish calendar against §9.4 targets, flag gaps before they break momentum, coordinate Shorts/Reels timing with long-form. Use when the Posting Schedule agent must act on its inputs and produce its defined output.
metadata:
  agent: posting-schedule
  source: Project Atlas Requirements §9.8
  layer: Growth
  host: vps
---

# manage-posting-schedule

Enforce consistent cadence across platforms: maintain the publish calendar against §9.4 targets, flag gaps before they break momentum, coordinate Shorts/Reels timing with long-form.

## When to use
- When the Posting Schedule agent is invoked in the Growth pipeline and its inputs are available.

## Inputs / Sources
Publish calendar + cadence targets

## Output
Schedule + gap alerts

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — This agent's core work is statistical/deterministic — compute in Python at zero LLM cost; call the model only to interpret a result or resolve ambiguity (spec §11.3).
