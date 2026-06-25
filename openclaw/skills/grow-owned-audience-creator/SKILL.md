---
name: grow-owned-audience-creator
description: Focus on sourcing, drafting, and creative selection for: Decouple revenue from platform risk: manage CTA placement for email/Discord/Telegram capture, run lead magnets (guides, archetype quizzes), segment subscribers by archetype interest. Use when the Owned Audience Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: owned-audience-creator
  source: Project Atlas Requirements §8.2
  layer: Monetization
  host: vps
---

# grow-owned-audience-creator

Focus on sourcing, drafting, and creative selection for: Decouple revenue from platform risk: manage CTA placement for email/Discord/Telegram capture, run lead magnets (guides, archetype quizzes), segment subscribers by archetype interest.

## When to use
- When the Owned Audience Creator agent is invoked in the Monetization pipeline and its inputs are available.

## Inputs / Sources
Video + audience segments

## Output
Draft proposal and creative options for: audience_capture entries

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
