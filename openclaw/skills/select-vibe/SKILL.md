---
name: select-vibe
description: Select emotional tone/style: epic, mysterious, dark, emotional, hopeful, motivational, intellectual, dramatic. Use when the Vibe agent must act on its inputs and produce its defined output.
metadata:
  agent: vibe
  source: Project Atlas Requirements §3.5
  layer: L5 Content Factory
  host: vps
---

# select-vibe

Select emotional tone/style: epic, mysterious, dark, emotional, hopeful, motivational, intellectual, dramatic.

## When to use
- When the Vibe agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
Story + Archetype

## Output
Vibe tag

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
