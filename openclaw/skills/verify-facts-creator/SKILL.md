---
name: verify-facts-creator
description: Focus on sourcing, drafting, and creative selection for: Verify dates, claims, statistics and sources before publishing; content-safety pass for demonetization triggers. Use when the Fact Verification Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: fact-verification-creator
  source: Project Atlas Requirements §3.5
  layer: L5 Content Factory
  host: vps
---

# verify-facts-creator

Focus on sourcing, drafting, and creative selection for: Verify dates, claims, statistics and sources before publishing; content-safety pass for demonetization triggers.

## When to use
- When the Fact Verification Creator agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
Knowledge Graph + sources

## Output
Draft proposal and creative options for: Verification report

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
