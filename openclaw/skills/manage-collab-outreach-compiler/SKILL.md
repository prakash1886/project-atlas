---
name: manage-collab-outreach-compiler
description: Focus on structural integrity, schemas, and format alignment for: Build a creator-to-creator growth channel: identify adjacent creators by archetype/audience overlap, manage outreach pipeline (reusing the Sponsorship CRM pattern), track collab vs solo performance. Use when the Collaboration Outreach Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: collaboration-outreach-compiler
  source: Project Atlas Requirements §9.8
  layer: Growth
  host: vps
---

# manage-collab-outreach-compiler

Focus on structural integrity, schemas, and format alignment for: Build a creator-to-creator growth channel: identify adjacent creators by archetype/audience overlap, manage outreach pipeline (reusing the Sponsorship CRM pattern), track collab vs solo performance.

## When to use
- When the Collaboration Outreach Compiler agent is invoked in the Growth pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Creator graph + audience overlap

## Output
Compiled and formatted candidate structure for: Outreach pipeline entries

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
