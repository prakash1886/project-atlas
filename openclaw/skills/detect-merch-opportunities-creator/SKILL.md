---
name: detect-merch-opportunities-creator
description: Focus on sourcing, drafting, and creative selection for: Detect topics suitable for merchandise (e.g. Stoicism, Wrestling, Leadership). Use when the Merch Opportunity Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: merch-opportunity-creator
  source: Project Atlas Requirements §3.6
  layer: L6 Commerce
  host: vps
---

# detect-merch-opportunities-creator

Focus on sourcing, drafting, and creative selection for: Detect topics suitable for merchandise (e.g. Stoicism, Wrestling, Leadership).

## When to use
- When the Merch Opportunity Creator agent is invoked in the L6 Commerce pipeline and its inputs are available.

## Inputs / Sources
Story + Archetype

## Output
Draft proposal and creative options for: Merch candidate list

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
