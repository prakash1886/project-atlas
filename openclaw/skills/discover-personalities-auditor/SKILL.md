---
name: discover-personalities-auditor
description: Focus on fact-checking, safety policies, and final validation for: Find athletes, leaders, entrepreneurs, philosophers, scientists, reformers, commanders across categories. Use when the Personality Discovery Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: personality-discovery-auditor
  source: Project Atlas Requirements §3.2
  layer: L2 Personality
  host: vps
---

# discover-personalities-auditor

Focus on fact-checking, safety policies, and final validation for: Find athletes, leaders, entrepreneurs, philosophers, scientists, reformers, commanders across categories.

## When to use
- When the Personality Discovery Auditor agent is invoked in the L2 Personality pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Trend + Coverage data

## Output
Validated final output: Personality candidate list (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
