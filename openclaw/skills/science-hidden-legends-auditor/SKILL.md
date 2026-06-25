---
name: science-hidden-legends-auditor
description: Focus on fact-checking, safety policies, and final validation for: Mine Wikipedia, books, biographies and archives for high story-quality / low-coverage personalities. Use when the Hidden Legends Discovery Scientist Auditor agent must act on its inputs and produce its defined output.
metadata:
  agent: hidden-legends-discovery-scientist-auditor
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-hidden-legends-auditor

Focus on fact-checking, safety policies, and final validation for: Mine Wikipedia, books, biographies and archives for high story-quality / low-coverage personalities.

## When to use
- When the Hidden Legends Discovery Scientist Auditor agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Compiled candidate from Compiler + original sources: Wikipedia/books/biographies/archives

## Output
Validated final output: High-quality low-coverage candidates (approved or rejected with feedback)

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
