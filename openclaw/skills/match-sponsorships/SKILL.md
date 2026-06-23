---
name: match-sponsorships
description: Build a repeatable brand-deal pipeline: match archetype/audience to advertiser categories, maintain a CRM pipeline (prospect→outreach→negotiation→delivered→paid), track rate benchmarks by view tier. Use when the Sponsorship Matching agent must act on its inputs and produce its defined output.
metadata:
  agent: sponsorship-matching
  source: Project Atlas Requirements §8.2
  layer: Monetization
  host: vps
---

# match-sponsorships

Build a repeatable brand-deal pipeline: match archetype/audience to advertiser categories, maintain a CRM pipeline (prospect→outreach→negotiation→delivered→paid), track rate benchmarks by view tier.

## When to use
- When the Sponsorship Matching agent is invoked in the Monetization pipeline and its inputs are available.

## Inputs / Sources
Archetype/audience profile + performance

## Output
sponsorship_deals pipeline entries

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
