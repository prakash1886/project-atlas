---
name: gatekeep-opportunity-compiler
description: Focus on structural integrity, schemas, and format alignment for: Final gatekeeper above all agents: decide if a personality is worth covering, estimate whether it can generate 50+ stories, identify which audiences/countries care, assess YouTube saturation, shareability and retention likelihood. Use when the Story Opportunity Intelligence Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: story-opportunity-intelligence-compiler
  source: Project Atlas Requirements §3.7
  layer: Executive
  host: vps
---

# gatekeep-opportunity-compiler

Focus on structural integrity, schemas, and format alignment for: Final gatekeeper above all agents: decide if a personality is worth covering, estimate whether it can generate 50+ stories, identify which audiences/countries care, assess YouTube saturation, shareability and retention likelihood.

## When to use
- When the Story Opportunity Intelligence Compiler agent is invoked in the Executive pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Outputs of all discovery/intelligence agents

## Output
Compiled and formatted candidate structure for: {go_no_go, can_generate_50plus, target_regions, saturation, rationale}

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
