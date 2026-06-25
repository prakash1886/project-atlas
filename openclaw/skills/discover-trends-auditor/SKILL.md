---
name: discover-trends-auditor
description: Focus on fact-checking, safety policies, and final validation for: Continuously discover rising topics, personalities, events and discussions. Use when the Trend Discovery Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: trend-discovery-auditor
  source: Project Atlas Requirements §3.1
  layer: L1 Trend
  host: vps
---

# discover-trends-auditor

Focus on fact-checking, safety policies, and final validation for: Continuously discover rising topics, personalities, events and discussions.

## When to use
- When the Trend Discovery Auditor agent is invoked in the L1 Trend pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Google Trends, YouTube, Reddit, News, Wikipedia, Podcasts, Quora (fetched/cleaned via Jina Reader)

## Output
Validated final output: {topic, trend_score, regions, growth_rate} (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
