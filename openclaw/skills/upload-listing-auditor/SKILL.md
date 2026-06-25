---
name: upload-listing-auditor
description: Focus on fact-checking, safety policies, and final validation for: Publish approved, human-created artwork to Redbubble and other POD platforms under correct human-creator disclosure; apply product type, tags, pricing; enforce FTC affiliate + AI disclosure gates; log the live listing URL. Use when the Upload Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: upload-auditor
  source: Project Atlas Requirements §10.2
  layer: Merch
  host: vps
---

# upload-listing-auditor

Focus on fact-checking, safety policies, and final validation for: Publish approved, human-created artwork to Redbubble and other POD platforms under correct human-creator disclosure; apply product type, tags, pricing; enforce FTC affiliate + AI disclosure gates; log the live listing URL.

## When to use
- When the Upload Auditor agent is invoked in the Merch pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Approved designer_tasks

## Output
Validated final output: listing_url + disclosure status (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
