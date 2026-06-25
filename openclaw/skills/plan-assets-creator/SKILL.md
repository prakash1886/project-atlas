---
name: plan-assets-creator
description: Focus on sourcing, drafting, and creative selection for: Determine B-roll, music, images, and templates; query Envato Elements MCP; generate Google Veo and Higgsfield AI prompts for visual gaps; construct HeyGen presenter inputs. Use when the Asset Planner Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: asset-planner-creator
  source: Project Atlas Requirements §3.5/10.2
  layer: L5 Content Factory
  host: railway
---

# plan-assets-creator

Focus on sourcing, drafting, and creative selection for: Determine B-roll, music, images, and templates; query Envato Elements MCP; generate Google Veo and Higgsfield AI prompts for visual gaps; construct HeyGen presenter inputs.

## When to use
- When the Asset Planner Creator agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
Script + Vibe

## Output
Draft proposal and creative options for: Asset manifest JSON

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
