---
name: review-submission-compiler
description: Focus on structural integrity, schemas, and format alignment for: Gate submissions and manifests: check against brief/script, run IP pass, enforce Envato incorporation (merch), and verify elements licenses in envato_asset_references (videos). Use when the Submission Review Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: submission-review-compiler
  source: Project Atlas Requirements §10.2
  layer: Merch
  host: railway
---

# review-submission-compiler

Focus on structural integrity, schemas, and format alignment for: Gate submissions and manifests: check against brief/script, run IP pass, enforce Envato incorporation (merch), and verify elements licenses in envato_asset_references (videos).

## When to use
- When the Submission Review Compiler agent is invoked in the Merch pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: designer_tasks (submitted) + envato_asset_references

## Output
Compiled and formatted candidate structure for: review_outcome + notes

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
