---
name: assign-designer-auditor
description: Focus on fact-checking, safety policies, and final validation for: Route briefs to the right available human designer by skill tag, workload and past performance; balance queue depth; escalate unassigned time-sensitive briefs before their window closes. Use when the Designer Assignment Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: designer-assignment-auditor
  source: Project Atlas Requirements §10.2
  layer: Merch
  host: vps
---

# assign-designer-auditor

Focus on fact-checking, safety policies, and final validation for: Route briefs to the right available human designer by skill tag, workload and past performance; balance queue depth; escalate unassigned time-sensitive briefs before their window closes.

## When to use
- When the Designer Assignment Auditor agent is invoked in the Merch pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: merch_briefs + designers table

## Output
Validated final output: designer_tasks (assigned) (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
