---
name: discover-products
description: Identify specific products: posters, journals, shirts, digital products, courses. Use when the Product Discovery agent must act on its inputs and produce its defined output.
metadata:
  agent: product-discovery
  source: Project Atlas Requirements §3.6
  layer: L6 Commerce
  host: vps
---

# discover-products

Identify specific products: posters, journals, shirts, digital products, courses.

## When to use
- When the Product Discovery agent is invoked in the L6 Commerce pipeline and its inputs are available.

## Inputs / Sources
Merch candidates

## Output
Product list

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
