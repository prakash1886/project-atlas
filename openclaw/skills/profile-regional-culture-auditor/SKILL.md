---
name: profile-regional-culture-auditor
description: Focus on fact-checking, safety policies, and final validation for: Determine India / USA / Europe / Australia product preferences. Use when the Regional Culture Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: regional-culture-auditor
  source: Project Atlas Requirements §3.6
  layer: L6 Commerce
  host: vps
---

# profile-regional-culture-auditor

Focus on fact-checking, safety policies, and final validation for: Determine India / USA / Europe / Australia product preferences.

## When to use
- When the Regional Culture Auditor agent is invoked in the L6 Commerce pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Geographic Intelligence

## Output
Validated final output: Regional preference profile (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
