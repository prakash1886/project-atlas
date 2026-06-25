---
name: manage-affiliates-auditor
description: Focus on fact-checking, safety policies, and final validation for: Turn every relevant story into a trackable affiliate placement: select program per story/archetype, generate and rotate tracked links, insert into descriptions/pinned comments/cards, A/B test, reconcile weekly. Affiliate insertion is a publish-blocking gate (spec §8.11). Use when the Affiliate Management Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: affiliate-management-auditor
  source: Project Atlas Requirements §8.2
  layer: Monetization
  host: vps
---

# manage-affiliates-auditor

Focus on fact-checking, safety policies, and final validation for: Turn every relevant story into a trackable affiliate placement: select program per story/archetype, generate and rotate tracked links, insert into descriptions/pinned comments/cards, A/B test, reconcile weekly. Affiliate insertion is a publish-blocking gate (spec §8.11).

## When to use
- When the Affiliate Management Auditor agent is invoked in the Monetization pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Story + Archetype + affiliate_links table

## Output
Validated final output: {program, tracked_url, placement_type} (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
