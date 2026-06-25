---
name: science-hidden-legends-compiler
description: Focus on structural integrity, schemas, and format alignment for: Mine Wikipedia, books, biographies and archives for high story-quality / low-coverage personalities. Use when the Hidden Legends Discovery Scientist Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: hidden-legends-discovery-scientist-compiler
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-hidden-legends-compiler

Focus on structural integrity, schemas, and format alignment for: Mine Wikipedia, books, biographies and archives for high story-quality / low-coverage personalities.

## When to use
- When the Hidden Legends Discovery Scientist Compiler agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Wikipedia/books/biographies/archives

## Output
Compiled and formatted candidate structure for: High-quality low-coverage candidates

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
