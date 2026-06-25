---
name: flag-retention-risks-compiler
description: Focus on structural integrity, schemas, and format alignment for: Identify weak intros, slow sections and drop-off points before upload. Use when the Retention Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: retention-compiler
  source: Project Atlas Requirements §3.5
  layer: L5 Content Factory
  host: railway
---

# flag-retention-risks-compiler

Focus on structural integrity, schemas, and format alignment for: Identify weak intros, slow sections and drop-off points before upload.

## When to use
- When the Retention Compiler agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Draft script/video

## Output
Compiled and formatted candidate structure for: Retention risk flags

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
