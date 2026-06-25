---
name: direct-voice-compiler
description: Focus on structural integrity, schemas, and format alignment for: Choose narration voice, pace, energy and emotion per channel/persona. Use when the Voice Director Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: voice-director-compiler
  source: Project Atlas Requirements §3.5
  layer: L5 Content Factory
  host: railway
---

# direct-voice-compiler

Focus on structural integrity, schemas, and format alignment for: Choose narration voice, pace, energy and emotion per channel/persona.

## When to use
- When the Voice Director Compiler agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: voice_profiles table

## Output
Compiled and formatted candidate structure for: Voice assignment

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
