---
name: find-coverage-gaps-auditor
description: Focus on fact-checking, safety policies, and final validation for: Find high-demand, low-content-supply opportunities. Use when the Coverage Gap Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: coverage-gap-auditor
  source: Project Atlas Requirements §3.1
  layer: L1 Trend
  host: vps
---

# find-coverage-gaps-auditor

Focus on fact-checking, safety policies, and final validation for: Find high-demand, low-content-supply opportunities.

## When to use
- When the Coverage Gap Auditor agent is invoked in the L1 Trend pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Search volume + content supply data (Brave + Exa)

## Output
Validated final output: {personality, interest_score, coverage_score, gap_score} (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
