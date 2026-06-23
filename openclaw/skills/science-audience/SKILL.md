---
name: science-audience
description: Analyze views, retention, comments, shares, geography and subscribers to discover who is actually watching. Use when the Audience Scientist agent must act on its inputs and produce its defined output.
metadata:
  agent: audience-scientist
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-audience

Analyze views, retention, comments, shares, geography and subscribers to discover who is actually watching.

## When to use
- When the Audience Scientist agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
YouTube/IG analytics

## Output
Audience insight report

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — This agent's core work is statistical/deterministic — compute in Python at zero LLM cost; call the model only to interpret a result or resolve ambiguity (spec §11.3).
