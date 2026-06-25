---
name: build-personality-graph-creator
description: Focus on sourcing, drafting, and creative selection for: Build the relationship graph for each person: relationships, psychology, rivalries, failures, successes, mentors, legacy. Use when the Personality Graph Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: personality-graph-creator
  source: Project Atlas Requirements §3.2
  layer: L2 Personality
  host: vps
---

# build-personality-graph-creator

Focus on sourcing, drafting, and creative selection for: Build the relationship graph for each person: relationships, psychology, rivalries, failures, successes, mentors, legacy.

## When to use
- When the Personality Graph Creator agent is invoked in the L2 Personality pipeline and its inputs are available.

## Inputs / Sources
Research outputs

## Output
Draft proposal and creative options for: Graph nodes/edges in Apache AGE

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
