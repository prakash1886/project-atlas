---
name: optimize-ctr
description: Maximize click-through from cold impressions: generate and A/B test thumbnail/title variants, track CTR by archetype/personality, feed winning patterns back to the Thumbnail agent. Use when the Thumbnail/Title CTR agent must act on its inputs and produce its defined output.
metadata:
  agent: thumbnail-title-ctr
  source: Project Atlas Requirements §9.8
  layer: Growth
  host: vps
---

# optimize-ctr

Maximize click-through from cold impressions: generate and A/B test thumbnail/title variants, track CTR by archetype/personality, feed winning patterns back to the Thumbnail agent.

## When to use
- When the Thumbnail/Title CTR agent is invoked in the Growth pipeline and its inputs are available.

## Inputs / Sources
Video + impression CTR data

## Output
{variants, winner, ctr_by_archetype}

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
