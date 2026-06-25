---
name: grow-owned-audience-auditor
description: Focus on fact-checking, safety policies, and final validation for: Decouple revenue from platform risk: manage CTA placement for email/Discord/Telegram capture, run lead magnets (guides, archetype quizzes), segment subscribers by archetype interest. Use when the Owned Audience Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: owned-audience-auditor
  source: Project Atlas Requirements §8.2
  layer: Monetization
  host: vps
---

# grow-owned-audience-auditor

Focus on fact-checking, safety policies, and final validation for: Decouple revenue from platform risk: manage CTA placement for email/Discord/Telegram capture, run lead magnets (guides, archetype quizzes), segment subscribers by archetype interest.

## When to use
- When the Owned Audience Auditor agent is invoked in the Monetization pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Video + audience segments

## Output
Validated final output: audience_capture entries (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
