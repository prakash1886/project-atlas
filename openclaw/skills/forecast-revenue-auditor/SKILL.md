---
name: forecast-revenue-auditor
description: Focus on fact-checking, safety policies, and final validation for: Predict RPM, affiliate, merch and sponsorship potential. Use when the Revenue Optimization Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: revenue-optimization-auditor
  source: Project Atlas Requirements §3.6
  layer: L6 Commerce
  host: vps
---

# forecast-revenue-auditor

Focus on fact-checking, safety policies, and final validation for: Predict RPM, affiliate, merch and sponsorship potential.

## When to use
- When the Revenue Optimization Auditor agent is invoked in the L6 Commerce pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Story + Audience + Region data

## Output
Validated final output: Revenue forecast (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
