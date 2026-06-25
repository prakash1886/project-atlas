---
name: find-coverage-gaps-compiler
description: Focus on structural integrity, schemas, and format alignment for: Find high-demand, low-content-supply opportunities. Use when the Coverage Gap Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: coverage-gap-compiler
  source: Project Atlas Requirements §3.1
  layer: L1 Trend
  host: vps
---

# find-coverage-gaps-compiler

Focus on structural integrity, schemas, and format alignment for: Find high-demand, low-content-supply opportunities.

## When to use
- When the Coverage Gap Compiler agent is invoked in the L1 Trend pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Search volume + content supply data (Brave + Exa)

## Output
Compiled and formatted candidate structure for: {personality, interest_score, coverage_score, gap_score}

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
