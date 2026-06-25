---
name: verify-facts-auditor
description: Focus on fact-checking, safety policies, and final validation for: Verify dates, claims, statistics and sources before publishing; content-safety pass for demonetization triggers. Use when the Fact Verification Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: fact-verification-auditor
  source: Project Atlas Requirements §3.5
  layer: L5 Content Factory
  host: vps
---

# verify-facts-auditor

Focus on fact-checking, safety policies, and final validation for: Verify dates, claims, statistics and sources before publishing; content-safety pass for demonetization triggers.

## When to use
- When the Fact Verification Auditor agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Knowledge Graph + sources

## Output
Validated final output: Verification report (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
