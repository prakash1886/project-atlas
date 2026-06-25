---
name: plan-assets-auditor
description: Focus on fact-checking, safety policies, and final validation for: Determine B-roll, music, images, and templates; query Envato Elements MCP; generate Google Veo and Higgsfield AI prompts for visual gaps; construct HeyGen presenter inputs. Use when the Asset Planner Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: asset-planner-auditor
  source: Project Atlas Requirements §3.5/10.2
  layer: L5 Content Factory
  host: railway
---

# plan-assets-auditor

Focus on fact-checking, safety policies, and final validation for: Determine B-roll, music, images, and templates; query Envato Elements MCP; generate Google Veo and Higgsfield AI prompts for visual gaps; construct HeyGen presenter inputs.

## When to use
- When the Asset Planner Auditor agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Script + Vibe

## Output
Validated final output: Asset manifest JSON (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
