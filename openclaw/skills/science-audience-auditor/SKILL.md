---
name: science-audience-auditor
description: Focus on fact-checking, safety policies, and final validation for: Analyze views, retention, comments, shares, geography and subscribers to discover who is actually watching. Use when the Audience Scientist Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: audience-scientist-auditor
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-audience-auditor

Focus on fact-checking, safety policies, and final validation for: Analyze views, retention, comments, shares, geography and subscribers to discover who is actually watching.

## When to use
- When the Audience Scientist Auditor agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: YouTube/IG analytics

## Output
Validated final output: Audience insight report (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
