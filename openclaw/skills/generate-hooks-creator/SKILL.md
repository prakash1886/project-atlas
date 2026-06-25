---
name: generate-hooks-creator
description: Focus on sourcing, drafting, and creative selection for: Generate curiosity, contrarian, emotional and authority hooks for the first 3 seconds. Use when the Hook Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: hook-creator
  source: Project Atlas Requirements §3.5
  layer: L5 Content Factory
  host: vps
---

# generate-hooks-creator

Focus on sourcing, drafting, and creative selection for: Generate curiosity, contrarian, emotional and authority hooks for the first 3 seconds.

## When to use
- When the Hook Creator agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
Story + hook_patterns table

## Output
Draft proposal and creative options for: Hook copy

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
