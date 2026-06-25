---
name: discover-products-auditor
description: Focus on fact-checking, safety policies, and final validation for: Identify specific products: posters, journals, shirts, digital products, courses. Use when the Product Discovery Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: product-discovery-auditor
  source: Project Atlas Requirements §3.6
  layer: L6 Commerce
  host: vps
---

# discover-products-auditor

Focus on fact-checking, safety policies, and final validation for: Identify specific products: posters, journals, shirts, digital products, courses.

## When to use
- When the Product Discovery Auditor agent is invoked in the L6 Commerce pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Merch candidates

## Output
Validated final output: Product list (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
