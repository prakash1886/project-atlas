---
name: detect-merch-opportunities-compiler
description: Focus on structural integrity, schemas, and format alignment for: Detect topics suitable for merchandise (e.g. Stoicism, Wrestling, Leadership). Use when the Merch Opportunity Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: merch-opportunity-compiler
  source: Project Atlas Requirements §3.6
  layer: L6 Commerce
  host: vps
---

# detect-merch-opportunities-compiler

Focus on structural integrity, schemas, and format alignment for: Detect topics suitable for merchandise (e.g. Stoicism, Wrestling, Leadership).

## When to use
- When the Merch Opportunity Compiler agent is invoked in the L6 Commerce pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Story + Archetype

## Output
Compiled and formatted candidate structure for: Merch candidate list

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
