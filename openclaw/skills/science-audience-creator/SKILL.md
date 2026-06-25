---
name: science-audience-creator
description: Focus on sourcing, drafting, and creative selection for: Analyze views, retention, comments, shares, geography and subscribers to discover who is actually watching. Use when the Audience Scientist Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: audience-scientist-creator
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-audience-creator

Focus on sourcing, drafting, and creative selection for: Analyze views, retention, comments, shares, geography and subscribers to discover who is actually watching.

## When to use
- When the Audience Scientist Creator agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
YouTube/IG analytics

## Output
Draft proposal and creative options for: Audience insight report

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
