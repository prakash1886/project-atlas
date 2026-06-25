---
name: science-geography-compiler
description: Focus on structural integrity, schemas, and format alignment for: Learn regional content preferences (e.g. India → Cricket Psychology, USA → Wrestling Psychology) to influence backlog ranking. Use when the Geographic Intelligence Scientist Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: geographic-intelligence-scientist-compiler
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-geography-compiler

Focus on structural integrity, schemas, and format alignment for: Learn regional content preferences (e.g. India → Cricket Psychology, USA → Wrestling Psychology) to influence backlog ranking.

## When to use
- When the Geographic Intelligence Scientist Compiler agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Regional performance data

## Output
Compiled and formatted candidate structure for: Regional preference weights

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
