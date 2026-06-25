---
name: science-geography-auditor
description: Focus on fact-checking, safety policies, and final validation for: Learn regional content preferences (e.g. India → Cricket Psychology, USA → Wrestling Psychology) to influence backlog ranking. Use when the Geographic Intelligence Scientist Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: geographic-intelligence-scientist-auditor
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-geography-auditor

Focus on fact-checking, safety policies, and final validation for: Learn regional content preferences (e.g. India → Cricket Psychology, USA → Wrestling Psychology) to influence backlog ranking.

## When to use
- When the Geographic Intelligence Scientist Auditor agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Regional performance data

## Output
Validated final output: Regional preference weights (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
