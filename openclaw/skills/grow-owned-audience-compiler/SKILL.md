---
name: grow-owned-audience-compiler
description: Focus on structural integrity, schemas, and format alignment for: Decouple revenue from platform risk: manage CTA placement for email/Discord/Telegram capture, run lead magnets (guides, archetype quizzes), segment subscribers by archetype interest. Use when the Owned Audience Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: owned-audience-compiler
  source: Project Atlas Requirements §8.2
  layer: Monetization
  host: vps
---

# grow-owned-audience-compiler

Focus on structural integrity, schemas, and format alignment for: Decouple revenue from platform risk: manage CTA placement for email/Discord/Telegram capture, run lead magnets (guides, archetype quizzes), segment subscribers by archetype interest.

## When to use
- When the Owned Audience Compiler agent is invoked in the Monetization pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Video + audience segments

## Output
Compiled and formatted candidate structure for: audience_capture entries

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
