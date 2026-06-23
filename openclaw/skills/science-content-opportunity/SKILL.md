---
name: science-content-opportunity
description: Nightly analysis of Trends/YouTube/Reddit/Wikipedia/Search/News to recommend topics with scores and reasons. Use when the Content Opportunity Scientist agent must act on its inputs and produce its defined output.
metadata:
  agent: content-opportunity-scientist
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-content-opportunity

Nightly analysis of Trends/YouTube/Reddit/Wikipedia/Search/News to recommend topics with scores and reasons.

## When to use
- When the Content Opportunity Scientist agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Trend/YouTube/Reddit/Wikipedia/Search/News feeds

## Output
Ranked topic recommendations + reasons

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — This agent's core work is statistical/deterministic — compute in Python at zero LLM cost; call the model only to interpret a result or resolve ambiguity (spec §11.3).
