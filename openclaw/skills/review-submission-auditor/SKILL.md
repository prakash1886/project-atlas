---
name: review-submission-auditor
description: Focus on fact-checking, safety policies, and final validation for: Gate submissions and manifests: check against brief/script, run IP pass, enforce Envato incorporation (merch), and verify elements licenses in envato_asset_references (videos). Use when the Submission Review Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: submission-review-auditor
  source: Project Atlas Requirements §10.2
  layer: Merch
  host: railway
---

# review-submission-auditor

Focus on fact-checking, safety policies, and final validation for: Gate submissions and manifests: check against brief/script, run IP pass, enforce Envato incorporation (merch), and verify elements licenses in envato_asset_references (videos).

## When to use
- When the Submission Review Auditor agent is invoked in the Merch pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: designer_tasks (submitted) + envato_asset_references

## Output
Validated final output: review_outcome + notes (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
