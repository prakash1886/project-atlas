---
name: generate-hooks-compiler
description: Focus on structural integrity, schemas, and format alignment for: Generate curiosity, contrarian, emotional and authority hooks for the first 3 seconds. Use when the Hook Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: hook-compiler
  source: Project Atlas Requirements §3.5
  layer: L5 Content Factory
  host: vps
---

# generate-hooks-compiler

Focus on structural integrity, schemas, and format alignment for: Generate curiosity, contrarian, emotional and authority hooks for the first 3 seconds.

## When to use
- When the Hook Compiler agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Story + hook_patterns table

## Output
Compiled and formatted candidate structure for: Hook copy

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
