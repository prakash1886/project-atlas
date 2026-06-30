---
name: find-coverage-gaps-creator
description: Focus on sourcing, drafting, and creative selection for: Find high-demand, low-content-supply opportunities. Use when the Coverage Gap Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: coverage-gap-creator
  source: Project Atlas Requirements §3.1
  layer: L1 Trend
  host: vps
---

# find-coverage-gaps-creator

Focus on sourcing, drafting, and creative selection for: Find high-demand, low-content-supply opportunities.

## When to use
- When the Coverage Gap Creator agent is invoked in the L1 Trend pipeline and its inputs are available.

## Inputs / Sources
Search volume + content supply data (Brave + Exa). For niche/keyword-level opportunity
scoring (volume vs. competition) and channel supply lookups, prefer the `vidiq` MCP
server's tools (`vidiq_keyword_research`, `vidiq_channel_search`, `vidiq_breakout_channels`)
first -- it is the prioritized subscription. Fall back to `nexlev` MCP tools only if vidiq
can't answer the lookup.

## Output
Draft proposal and creative options for: {personality, interest_score, coverage_score, gap_score}

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
