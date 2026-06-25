---
name: assign-designer-compiler
description: Focus on structural integrity, schemas, and format alignment for: Route briefs to the right available human designer by skill tag, workload and past performance; balance queue depth; escalate unassigned time-sensitive briefs before their window closes. Use when the Designer Assignment Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: designer-assignment-compiler
  source: Project Atlas Requirements §10.2
  layer: Merch
  host: vps
---

# assign-designer-compiler

Focus on structural integrity, schemas, and format alignment for: Route briefs to the right available human designer by skill tag, workload and past performance; balance queue depth; escalate unassigned time-sensitive briefs before their window closes.

## When to use
- When the Designer Assignment Compiler agent is invoked in the Merch pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: merch_briefs + designers table

## Output
Compiled and formatted candidate structure for: designer_tasks (assigned)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
