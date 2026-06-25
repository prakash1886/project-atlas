---
name: atomize-stories-auditor
description: Focus on fact-checking, safety policies, and final validation for: Transform one personality into dozens to hundreds of distinct story angles (leadership, failure, psychology, rivalries, relationships, communication). Use when the Story Atomizer Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: story-atomizer-auditor
  source: Project Atlas Requirements §3.3
  layer: L3 Story
  host: vps
---

# atomize-stories-auditor

Focus on fact-checking, safety policies, and final validation for: Transform one personality into dozens to hundreds of distinct story angles (leadership, failure, psychology, rivalries, relationships, communication).

## When to use
- When the Story Atomizer Auditor agent is invoked in the L3 Story pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Personality Graph

## Output
Validated final output: 50-200 story candidates per personality (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
