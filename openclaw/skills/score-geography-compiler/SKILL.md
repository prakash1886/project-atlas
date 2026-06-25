---
name: score-geography-compiler
description: Focus on structural integrity, schemas, and format alignment for: Calculate India / US / Europe / Australia relevance scores. Use when the Geographic Intelligence Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: geographic-intelligence-compiler
  source: Project Atlas Requirements §3.4
  layer: L4 Audience
  host: vps
---

# score-geography-compiler

Focus on structural integrity, schemas, and format alignment for: Calculate India / US / Europe / Australia relevance scores.

## When to use
- When the Geographic Intelligence Compiler agent is invoked in the L4 Audience pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Trend + audience data

## Output
Compiled and formatted candidate structure for: {india, usa, europe, australia} scores

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
