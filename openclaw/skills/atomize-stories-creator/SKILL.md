---
name: atomize-stories-creator
description: Focus on sourcing, drafting, and creative selection for: Transform one personality into dozens to hundreds of distinct story angles (leadership, failure, psychology, rivalries, relationships, communication). Use when the Story Atomizer Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: story-atomizer-creator
  source: Project Atlas Requirements §3.3
  layer: L3 Story
  host: vps
---

# atomize-stories-creator

Focus on sourcing, drafting, and creative selection for: Transform one personality into dozens to hundreds of distinct story angles (leadership, failure, psychology, rivalries, relationships, communication).

## When to use
- When the Story Atomizer Creator agent is invoked in the L3 Story pipeline and its inputs are available.

## Inputs / Sources
Personality Graph

## Output
Draft proposal and creative options for: 50-200 story candidates per personality

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
