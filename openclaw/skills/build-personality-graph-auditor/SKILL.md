---
name: build-personality-graph-auditor
description: Focus on fact-checking, safety policies, and final validation for: Build the relationship graph for each person: relationships, psychology, rivalries, failures, successes, mentors, legacy. Use when the Personality Graph Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: personality-graph-auditor
  source: Project Atlas Requirements §3.2
  layer: L2 Personality
  host: vps
---

# build-personality-graph-auditor

Focus on fact-checking, safety policies, and final validation for: Build the relationship graph for each person: relationships, psychology, rivalries, failures, successes, mentors, legacy.

## When to use
- When the Personality Graph Auditor agent is invoked in the L2 Personality pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Research outputs

## Output
Validated final output: Graph nodes/edges in Apache AGE (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
