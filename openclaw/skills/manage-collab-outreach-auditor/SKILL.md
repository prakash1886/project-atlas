---
name: manage-collab-outreach-auditor
description: Focus on fact-checking, safety policies, and final validation for: Build a creator-to-creator growth channel: identify adjacent creators by archetype/audience overlap, manage outreach pipeline (reusing the Sponsorship CRM pattern), track collab vs solo performance. Use when the Collaboration Outreach Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: collaboration-outreach-auditor
  source: Project Atlas Requirements §9.8
  layer: Growth
  host: vps
---

# manage-collab-outreach-auditor

Focus on fact-checking, safety policies, and final validation for: Build a creator-to-creator growth channel: identify adjacent creators by archetype/audience overlap, manage outreach pipeline (reusing the Sponsorship CRM pattern), track collab vs solo performance.

## When to use
- When the Collaboration Outreach Auditor agent is invoked in the Growth pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Creator graph + audience overlap

## Output
Validated final output: Outreach pipeline entries (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
