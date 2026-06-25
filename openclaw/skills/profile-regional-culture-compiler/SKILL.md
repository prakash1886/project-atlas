---
name: profile-regional-culture-compiler
description: Focus on structural integrity, schemas, and format alignment for: Determine India / USA / Europe / Australia product preferences. Use when the Regional Culture Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: regional-culture-compiler
  source: Project Atlas Requirements §3.6
  layer: L6 Commerce
  host: vps
---

# profile-regional-culture-compiler

Focus on structural integrity, schemas, and format alignment for: Determine India / USA / Europe / Australia product preferences.

## When to use
- When the Regional Culture Compiler agent is invoked in the L6 Commerce pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Geographic Intelligence

## Output
Compiled and formatted candidate structure for: Regional preference profile

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
