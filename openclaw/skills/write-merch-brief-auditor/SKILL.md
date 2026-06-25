---
name: write-merch-brief-auditor
description: Focus on fact-checking, safety policies, and final validation for: Convert a detected merch opportunity into a concrete, designer-ready brief: product type, theme, archetype, target region, key motif, and a hard deadline tied to the event's relevance window; flag time-sensitive vs evergreen. Use when the Merch Task Brief Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: merch-task-brief-auditor
  source: Project Atlas Requirements §10.2
  layer: Merch
  host: vps
---

# write-merch-brief-auditor

Focus on fact-checking, safety policies, and final validation for: Convert a detected merch opportunity into a concrete, designer-ready brief: product type, theme, archetype, target region, key motif, and a hard deadline tied to the event's relevance window; flag time-sensitive vs evergreen.

## When to use
- When the Merch Task Brief Auditor agent is invoked in the Merch pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Merch Opportunity + Product Discovery + event/festival/trend calendars

## Output
Validated final output: merch_briefs record (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
