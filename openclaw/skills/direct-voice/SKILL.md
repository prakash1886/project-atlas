---
name: direct-voice
description: Choose narration voice, pace, energy and emotion per channel/persona. Use when the Voice Director agent must act on its inputs and produce its defined output.
metadata:
  agent: voice-director
  source: Project Atlas Requirements §3.5
  layer: L5 Content Factory
  host: vps
---

# direct-voice

Choose narration voice, pace, energy and emotion per channel/persona.

## When to use
- When the Voice Director agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
voice_profiles table

## Output
Voice assignment

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
