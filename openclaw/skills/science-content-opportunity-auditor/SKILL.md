---
name: science-content-opportunity-auditor
description: Focus on fact-checking, safety policies, and final validation for: Nightly analysis of Trends/YouTube/Reddit/Wikipedia/Search/News to recommend topics with scores and reasons. Use when the Content Opportunity Scientist Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: content-opportunity-scientist-auditor
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-content-opportunity-auditor

Focus on fact-checking, safety policies, and final validation for: Nightly analysis of Trends/YouTube/Reddit/Wikipedia/Search/News to recommend topics with scores and reasons.

## When to use
- When the Content Opportunity Scientist Auditor agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Trend/YouTube/Reddit/Wikipedia/Search/News feeds

## Output
Validated final output: Ranked topic recommendations + reasons (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
