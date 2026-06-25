---
name: review-submission-creator
description: Focus on sourcing, drafting, and creative selection for: Gate submissions and manifests: check against brief/script, run IP pass, enforce Envato incorporation (merch), and verify elements licenses in envato_asset_references (videos). Use when the Submission Review Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: submission-review-creator
  source: Project Atlas Requirements §10.2
  layer: Merch
  host: railway
---

# review-submission-creator

Focus on sourcing, drafting, and creative selection for: Gate submissions and manifests: check against brief/script, run IP pass, enforce Envato incorporation (merch), and verify elements licenses in envato_asset_references (videos).

## When to use
- When the Submission Review Creator agent is invoked in the Merch pipeline and its inputs are available.

## Inputs / Sources
designer_tasks (submitted) + envato_asset_references

## Output
Draft proposal and creative options for: review_outcome + notes

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
