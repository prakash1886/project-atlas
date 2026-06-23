---
name: forecast-revenue
description: Predict RPM, affiliate, merch and sponsorship potential. Use when the Revenue Optimization agent must act on its inputs and produce its defined output.
metadata:
  agent: revenue-optimization
  source: Project Atlas Requirements §3.6
  layer: L6 Commerce
  host: vps
---

# forecast-revenue

Predict RPM, affiliate, merch and sponsorship potential.

## When to use
- When the Revenue Optimization agent is invoked in the L6 Commerce pipeline and its inputs are available.

## Inputs / Sources
Story + Audience + Region data

## Output
Revenue forecast

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — This agent's core work is statistical/deterministic — compute in Python at zero LLM cost; call the model only to interpret a result or resolve ambiguity (spec §11.3).
