---
name: assign-designer
description: Route briefs to the right available human designer by skill tag, workload and past performance; balance queue depth; escalate unassigned time-sensitive briefs before their window closes. Use when the Designer Assignment agent must act on its inputs and produce its defined output.
metadata:
  agent: designer-assignment
  source: Project Atlas Requirements §10.2
  layer: Merch
  host: vps
---

# assign-designer

Route briefs to the right available human designer by skill tag, workload and past performance; balance queue depth; escalate unassigned time-sensitive briefs before their window closes.

## When to use
- When the Designer Assignment agent is invoked in the Merch pipeline and its inputs are available.

## Inputs / Sources
merch_briefs + designers table

## Output
designer_tasks (assigned)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — This agent's core work is statistical/deterministic — compute in Python at zero LLM cost; call the model only to interpret a result or resolve ambiguity (spec §11.3).
