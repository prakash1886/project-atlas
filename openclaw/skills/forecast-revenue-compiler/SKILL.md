---
name: forecast-revenue-compiler
description: Focus on structural integrity, schemas, and format alignment for: Predict RPM, affiliate, merch and sponsorship potential. Use when the Revenue Optimization Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: revenue-optimization-compiler
  source: Project Atlas Requirements §3.6
  layer: L6 Commerce
  host: vps
---

# forecast-revenue-compiler

Focus on structural integrity, schemas, and format alignment for: Predict RPM, affiliate, merch and sponsorship potential.

## When to use
- When the Revenue Optimization Compiler agent is invoked in the L6 Commerce pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Story + Audience + Region data

## Output
Compiled and formatted candidate structure for: Revenue forecast

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
