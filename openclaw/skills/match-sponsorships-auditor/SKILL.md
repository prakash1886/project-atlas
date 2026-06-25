---
name: match-sponsorships-auditor
description: Focus on fact-checking, safety policies, and final validation for: Build a repeatable brand-deal pipeline: match archetype/audience to advertiser categories, maintain a CRM pipeline (prospect→outreach→negotiation→delivered→paid), track rate benchmarks by view tier. Use when the Sponsorship Matching Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: sponsorship-matching-auditor
  source: Project Atlas Requirements §8.2
  layer: Monetization
  host: vps
---

# match-sponsorships-auditor

Focus on fact-checking, safety policies, and final validation for: Build a repeatable brand-deal pipeline: match archetype/audience to advertiser categories, maintain a CRM pipeline (prospect→outreach→negotiation→delivered→paid), track rate benchmarks by view tier.

## When to use
- When the Sponsorship Matching Auditor agent is invoked in the Monetization pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Archetype/audience profile + performance

## Output
Validated final output: sponsorship_deals pipeline entries (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
