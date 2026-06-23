---
name: map-audience
description: Identify segments: students, professionals, entrepreneurs, managers, athletes, history lovers, etc. Use when the Audience Mapping agent must act on its inputs and produce its defined output.
metadata:
  agent: audience-mapping
  source: Project Atlas Requirements §3.4
  layer: L4 Audience
  host: vps
---

# map-audience

Identify segments: students, professionals, entrepreneurs, managers, athletes, history lovers, etc.

## When to use
- When the Audience Mapping agent is invoked in the L4 Audience pipeline and its inputs are available.

## Inputs / Sources
Story + Archetype data

## Output
audience_segments mapping

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
