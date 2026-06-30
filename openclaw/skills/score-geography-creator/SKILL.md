---
name: score-geography-creator
description: Focus on sourcing, drafting, and creative selection for: Calculate India / US / Europe / Australia relevance scores. Use when the Geographic Intelligence Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: geographic-intelligence-creator
  source: Project Atlas Requirements §3.4
  layer: L4 Audience
  host: vps
---

# score-geography-creator

Focus on sourcing, drafting, and creative selection for: Calculate India / US / Europe / Australia relevance scores.

## When to use
- When the Geographic Intelligence Creator agent is invoked in the L4 Audience pipeline and its inputs are available.

## Inputs / Sources
Trend + audience data. Use the `vidiq` MCP server's `vidiq_keyword_research` tool (with a
country code) to get real per-country search volume and top-markets data for the
India/US/Europe/Australia scores, rather than estimating regional relevance from training data.
vidiq is the prioritized subscription; fall back to `nexlev` only if vidiq can't answer the
lookup.

## Output
Draft proposal and creative options for: {india, usa, europe, australia} scores

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
