---
name: write-merch-brief-creator
description: Focus on sourcing, drafting, and creative selection for: Convert a detected merch opportunity into a concrete, designer-ready brief: product type, theme, archetype, target region, key motif, and a hard deadline tied to the event's relevance window; flag time-sensitive vs evergreen. Use when the Merch Task Brief Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: merch-task-brief-creator
  source: Project Atlas Requirements §10.2
  layer: Merch
  host: vps
---

# write-merch-brief-creator

Focus on sourcing, drafting, and creative selection for: Convert a detected merch opportunity into a concrete, designer-ready brief: product type, theme, archetype, target region, key motif, and a hard deadline tied to the event's relevance window; flag time-sensitive vs evergreen.

## When to use
- When the Merch Task Brief Creator agent is invoked in the Merch pipeline and its inputs are available.

## Inputs / Sources
Merch Opportunity + Product Discovery + event/festival/trend calendars

## Output
Draft proposal and creative options for: merch_briefs record

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
