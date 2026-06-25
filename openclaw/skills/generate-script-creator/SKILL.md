---
name: generate-script-creator
description: Focus on sourcing, drafting, and creative selection for: Generate shorts, reels, long-form video, podcast and blog scripts. Use when the Script Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: script-creator
  source: Project Atlas Requirements §3.5
  layer: L5 Content Factory
  host: modal
---

# generate-script-creator

Focus on sourcing, drafting, and creative selection for: Generate shorts, reels, long-form video, podcast and blog scripts.

## When to use
- When the Script Creator agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
Narrative outline

## Output
Draft proposal and creative options for: Final script text

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
