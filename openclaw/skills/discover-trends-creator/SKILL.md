---
name: discover-trends-creator
description: Focus on sourcing, drafting, and creative selection for: Continuously discover rising topics, personalities, events and discussions. Use when the Trend Discovery Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: trend-discovery-creator
  source: Project Atlas Requirements §3.1
  layer: L1 Trend
  host: vps
---

# discover-trends-creator

Focus on sourcing, drafting, and creative selection for: Continuously discover rising topics, personalities, events and discussions.

## When to use
- When the Trend Discovery Creator agent is invoked in the L1 Trend pipeline and its inputs are available.

## Inputs / Sources
Google Trends, YouTube, Reddit, News, Wikipedia, Podcasts, Quora (fetched/cleaned via Jina Reader).
Use the `vidiq` MCP server's `vidiq_trending_videos` and `vidiq_trend_categories` tools as a
real YouTube-native trend signal alongside the general web sources above. vidiq is the
prioritized subscription; fall back to `nexlev` only if vidiq can't answer the lookup.

## Output
Draft proposal and creative options for: {topic, trend_score, regions, growth_rate}

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
