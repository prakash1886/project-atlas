---
name: monetize-community-auditor
description: Focus on fact-checking, safety policies, and final validation for: Convert engaged viewers into recurring revenue: manage memberships, Patreon-equivalent tiers, paid courses/digital products; track churn and LTV. Use when the Community Monetization Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: community-monetization-auditor
  source: Project Atlas Requirements §8.2
  layer: Monetization
  host: vps
---

# monetize-community-auditor

Focus on fact-checking, safety policies, and final validation for: Convert engaged viewers into recurring revenue: manage memberships, Patreon-equivalent tiers, paid courses/digital products; track churn and LTV.

## When to use
- When the Community Monetization Auditor agent is invoked in the Monetization pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Membership data + top personalities

## Output
Validated final output: membership_tiers updates (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
