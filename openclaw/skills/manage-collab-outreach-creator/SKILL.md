---
name: manage-collab-outreach-creator
description: Focus on sourcing, drafting, and creative selection for: Build a creator-to-creator growth channel: identify adjacent creators by archetype/audience overlap, manage outreach pipeline (reusing the Sponsorship CRM pattern), track collab vs solo performance. Use when the Collaboration Outreach Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: collaboration-outreach-creator
  source: Project Atlas Requirements §9.8
  layer: Growth
  host: vps
---

# manage-collab-outreach-creator

Focus on sourcing, drafting, and creative selection for: Build a creator-to-creator growth channel: identify adjacent creators by archetype/audience overlap, manage outreach pipeline (reusing the Sponsorship CRM pattern), track collab vs solo performance.

## When to use
- When the Collaboration Outreach Creator agent is invoked in the Growth pipeline and its inputs are available.

## Inputs / Sources
Creator graph + audience overlap

## Output
Draft proposal and creative options for: Outreach pipeline entries

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
