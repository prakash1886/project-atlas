---
name: monetize-community-creator
description: Focus on sourcing, drafting, and creative selection for: Convert engaged viewers into recurring revenue: manage memberships, Patreon-equivalent tiers, paid courses/digital products; track churn and LTV. Use when the Community Monetization Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: community-monetization-creator
  source: Project Atlas Requirements §8.2
  layer: Monetization
  host: vps
---

# monetize-community-creator

Focus on sourcing, drafting, and creative selection for: Convert engaged viewers into recurring revenue: manage memberships, Patreon-equivalent tiers, paid courses/digital products; track churn and LTV.

## When to use
- When the Community Monetization Creator agent is invoked in the Monetization pipeline and its inputs are available.

## Inputs / Sources
Membership data + top personalities

## Output
Draft proposal and creative options for: membership_tiers updates

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
