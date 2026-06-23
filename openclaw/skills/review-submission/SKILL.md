---
name: review-submission
description: Gate every designer submission before it reaches a sales platform: check against the brief, run an IP-similarity/originality pass, enforce the Envato incorporation compliance gate (require incorporated_description), approve/revise/reject. Use when the Submission Review agent must act on its inputs and produce its defined output.
metadata:
  agent: submission-review
  source: Project Atlas Requirements §10.2
  layer: Merch
  host: vps
---

# review-submission

Gate every designer submission before it reaches a sales platform: check against the brief, run an IP-similarity/originality pass, enforce the Envato incorporation compliance gate (require incorporated_description), approve/revise/reject.

## When to use
- When the Submission Review agent is invoked in the Merch pipeline and its inputs are available.

## Inputs / Sources
designer_tasks (submitted) + envato_asset_references

## Output
review_outcome + notes

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
