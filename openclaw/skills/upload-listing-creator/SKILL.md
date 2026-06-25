---
name: upload-listing-creator
description: Focus on sourcing, drafting, and creative selection for: Publish approved, human-created artwork to Redbubble and other POD platforms under correct human-creator disclosure; apply product type, tags, pricing; enforce FTC affiliate + AI disclosure gates; log the live listing URL. Use when the Upload Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: upload-creator
  source: Project Atlas Requirements §10.2
  layer: Merch
  host: vps
---

# upload-listing-creator

Focus on sourcing, drafting, and creative selection for: Publish approved, human-created artwork to Redbubble and other POD platforms under correct human-creator disclosure; apply product type, tags, pricing; enforce FTC affiliate + AI disclosure gates; log the live listing URL.

## When to use
- When the Upload Creator agent is invoked in the Merch pipeline and its inputs are available.

## Inputs / Sources
Approved designer_tasks

## Output
Draft proposal and creative options for: listing_url + disclosure status

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
