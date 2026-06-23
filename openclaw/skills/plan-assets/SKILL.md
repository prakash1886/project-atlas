---
name: plan-assets
description: Determine footage, music, images, motion graphics and animation needs; query Envato Elements MCP for human-made raw assets for merch briefs (spec §10.2 extension). Use when the Asset Planner agent must act on its inputs and produce its defined output.
metadata:
  agent: asset-planner
  source: Project Atlas Requirements §3.5/10.2
  layer: L5 Content Factory
  host: vps
---

# plan-assets

Determine footage, music, images, motion graphics and animation needs; query Envato Elements MCP for human-made raw assets for merch briefs (spec §10.2 extension).

## When to use
- When the Asset Planner agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
Script + Vibe

## Output
Asset manifest JSON

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
