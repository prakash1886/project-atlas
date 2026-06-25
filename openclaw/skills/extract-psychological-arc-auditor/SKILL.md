---
name: extract-psychological-arc-auditor
description: Focus on fact-checking, safety policies, and final validation for: Extract identity, struggle, failure, growth, leadership, resilience, reinvention, legacy. Use when the Psychological Arc Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: psychological-arc-auditor
  source: Project Atlas Requirements §3.3
  layer: L3 Story
  host: vps
---

# extract-psychological-arc-auditor

Focus on fact-checking, safety policies, and final validation for: Extract identity, struggle, failure, growth, leadership, resilience, reinvention, legacy.

## When to use
- When the Psychological Arc Auditor agent is invoked in the L3 Story pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Biographies, interviews (via Exa)

## Output
Validated final output: psychological_arcs record (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
