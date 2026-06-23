---
name: science-geography
description: Learn regional content preferences (e.g. India → Cricket Psychology, USA → Wrestling Psychology) to influence backlog ranking. Use when the Geographic Intelligence Scientist agent must act on its inputs and produce its defined output.
metadata:
  agent: geographic-intelligence-scientist
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-geography

Learn regional content preferences (e.g. India → Cricket Psychology, USA → Wrestling Psychology) to influence backlog ranking.

## When to use
- When the Geographic Intelligence Scientist agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Regional performance data

## Output
Regional preference weights

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — This agent's core work is statistical/deterministic — compute in Python at zero LLM cost; call the model only to interpret a result or resolve ambiguity (spec §11.3).
