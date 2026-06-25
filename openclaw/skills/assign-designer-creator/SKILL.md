---
name: assign-designer-creator
description: Focus on sourcing, drafting, and creative selection for: Route briefs to the right available human designer by skill tag, workload and past performance; balance queue depth; escalate unassigned time-sensitive briefs before their window closes. Use when the Designer Assignment Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: designer-assignment-creator
  source: Project Atlas Requirements §10.2
  layer: Merch
  host: vps
---

# assign-designer-creator

Focus on sourcing, drafting, and creative selection for: Route briefs to the right available human designer by skill tag, workload and past performance; balance queue depth; escalate unassigned time-sensitive briefs before their window closes.

## When to use
- When the Designer Assignment Creator agent is invoked in the Merch pipeline and its inputs are available.

## Inputs / Sources
merch_briefs + designers table

## Output
Draft proposal and creative options for: designer_tasks (assigned)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
