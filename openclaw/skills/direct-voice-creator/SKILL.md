---
name: direct-voice-creator
description: Focus on sourcing, drafting, and creative selection for: Choose narration voice, pace, energy and emotion per channel/persona. Use when the Voice Director Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: voice-director-creator
  source: Project Atlas Requirements §3.5
  layer: L5 Content Factory
  host: railway
---

# direct-voice-creator

Focus on sourcing, drafting, and creative selection for: Choose narration voice, pace, energy and emotion per channel/persona.

## When to use
- When the Voice Director Creator agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
voice_profiles table

## Output
Draft proposal and creative options for: Voice assignment

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
