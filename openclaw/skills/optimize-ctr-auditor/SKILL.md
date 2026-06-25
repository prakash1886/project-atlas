---
name: optimize-ctr-auditor
description: Focus on fact-checking, safety policies, and final validation for: Maximize click-through from cold impressions: generate and A/B test thumbnail/title variants, track CTR by archetype/personality, feed winning patterns back to the Thumbnail agent. Use when the Thumbnail/Title CTR Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: thumbnail-title-ctr-auditor
  source: Project Atlas Requirements §9.8
  layer: Growth
  host: vps
---

# optimize-ctr-auditor

Focus on fact-checking, safety policies, and final validation for: Maximize click-through from cold impressions: generate and A/B test thumbnail/title variants, track CTR by archetype/personality, feed winning patterns back to the Thumbnail agent.

## When to use
- When the Thumbnail/Title CTR Auditor agent is invoked in the Growth pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Video + impression CTR data

## Output
Validated final output: {variants, winner, ctr_by_archetype} (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
