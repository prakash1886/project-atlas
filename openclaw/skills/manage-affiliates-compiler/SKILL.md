---
name: manage-affiliates-compiler
description: Focus on structural integrity, schemas, and format alignment for: Turn every relevant story into a trackable affiliate placement: select program per story/archetype, generate and rotate tracked links, insert into descriptions/pinned comments/cards, A/B test, reconcile weekly. Affiliate insertion is a publish-blocking gate (spec §8.11). Use when the Affiliate Management Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: affiliate-management-compiler
  source: Project Atlas Requirements §8.2
  layer: Monetization
  host: vps
---

# manage-affiliates-compiler

Focus on structural integrity, schemas, and format alignment for: Turn every relevant story into a trackable affiliate placement: select program per story/archetype, generate and rotate tracked links, insert into descriptions/pinned comments/cards, A/B test, reconcile weekly. Affiliate insertion is a publish-blocking gate (spec §8.11).

## When to use
- When the Affiliate Management Compiler agent is invoked in the Monetization pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Story + Archetype + affiliate_links table

## Output
Compiled and formatted candidate structure for: {program, tracked_url, placement_type}

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
