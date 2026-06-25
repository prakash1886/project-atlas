---
name: discover-hidden-legends-compiler
description: Focus on structural integrity, schemas, and format alignment for: Find unknown but fascinating people with extraordinary stories before they go mainstream. Use when the Hidden Legends Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: hidden-legends-compiler
  source: Project Atlas Requirements §3.2
  layer: L2 Personality
  host: vps
---

# discover-hidden-legends-compiler

Focus on structural integrity, schemas, and format alignment for: Find unknown but fascinating people with extraordinary stories before they go mainstream.

## When to use
- When the Hidden Legends Compiler agent is invoked in the L2 Personality pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Biography sources, Wikipedia gap analysis (Exa, Books, Archives)

## Output
Compiled and formatted candidate structure for: {name, story_quality, fame_score}

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
