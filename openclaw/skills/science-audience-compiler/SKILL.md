---
name: science-audience-compiler
description: Focus on structural integrity, schemas, and format alignment for: Analyze views, retention, comments, shares, geography and subscribers to discover who is actually watching. Use when the Audience Scientist Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: audience-scientist-compiler
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-audience-compiler

Focus on structural integrity, schemas, and format alignment for: Analyze views, retention, comments, shares, geography and subscribers to discover who is actually watching.

## When to use
- When the Audience Scientist Compiler agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: YouTube/IG analytics

## Output
Compiled and formatted candidate structure for: Audience insight report

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
