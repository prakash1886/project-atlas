---
name: discover-trends
description: Continuously discover rising topics, personalities, events and discussions. Use when the Trend Discovery agent must act on its inputs and produce its defined output.
metadata:
  agent: trend-discovery
  source: Project Atlas Requirements §3.1
  layer: L1 Trend
  host: vps
---

# discover-trends

Continuously discover rising topics, personalities, events and discussions.

## When to use
- When the Trend Discovery agent is invoked in the L1 Trend pipeline and its inputs are available.

## Inputs / Sources
Google Trends, YouTube, Reddit, News, Wikipedia, Podcasts, Quora (fetched/cleaned via Jina Reader)

## Output
{topic, trend_score, regions, growth_rate}

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
