---
name: select-vibe-creator
description: Focus on sourcing, drafting, and creative selection for: Select emotional tone/style: epic, mysterious, dark, emotional, hopeful, motivational, intellectual, dramatic. Use when the Vibe Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: vibe-creator
  source: Project Atlas Requirements §3.5
  layer: L5 Content Factory
  host: railway
---

# select-vibe-creator

Focus on sourcing, drafting, and creative selection for: Select emotional tone/style: epic, mysterious, dark, emotional, hopeful, motivational, intellectual, dramatic.

## When to use
- When the Vibe Creator agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
Story + Archetype

## Output
Draft proposal and creative options for: Vibe tag

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
