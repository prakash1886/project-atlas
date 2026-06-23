---
name: find-coverage-gaps
description: Find high-demand, low-content-supply opportunities. Use when the Coverage Gap agent must act on its inputs and produce its defined output.
metadata:
  agent: coverage-gap
  source: Project Atlas Requirements §3.1
  layer: L1 Trend
  host: vps
---

# find-coverage-gaps

Find high-demand, low-content-supply opportunities.

## When to use
- When the Coverage Gap agent is invoked in the L1 Trend pipeline and its inputs are available.

## Inputs / Sources
Search volume + content supply data (Brave + Exa)

## Output
{personality, interest_score, coverage_score, gap_score}

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
