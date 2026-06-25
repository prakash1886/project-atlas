---
name: score-geography-auditor
description: Focus on fact-checking, safety policies, and final validation for: Calculate India / US / Europe / Australia relevance scores. Use when the Geographic Intelligence Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: geographic-intelligence-auditor
  source: Project Atlas Requirements §3.4
  layer: L4 Audience
  host: vps
---

# score-geography-auditor

Focus on fact-checking, safety policies, and final validation for: Calculate India / US / Europe / Australia relevance scores.

## When to use
- When the Geographic Intelligence Auditor agent is invoked in the L4 Audience pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Trend + audience data

## Output
Validated final output: {india, usa, europe, australia} scores (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
