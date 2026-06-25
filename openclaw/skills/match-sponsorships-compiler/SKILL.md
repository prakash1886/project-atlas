---
name: match-sponsorships-compiler
description: Focus on structural integrity, schemas, and format alignment for: Build a repeatable brand-deal pipeline: match archetype/audience to advertiser categories, maintain a CRM pipeline (prospect→outreach→negotiation→delivered→paid), track rate benchmarks by view tier. Use when the Sponsorship Matching Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: sponsorship-matching-compiler
  source: Project Atlas Requirements §8.2
  layer: Monetization
  host: vps
---

# match-sponsorships-compiler

Focus on structural integrity, schemas, and format alignment for: Build a repeatable brand-deal pipeline: match archetype/audience to advertiser categories, maintain a CRM pipeline (prospect→outreach→negotiation→delivered→paid), track rate benchmarks by view tier.

## When to use
- When the Sponsorship Matching Compiler agent is invoked in the Monetization pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Archetype/audience profile + performance

## Output
Compiled and formatted candidate structure for: sponsorship_deals pipeline entries

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
