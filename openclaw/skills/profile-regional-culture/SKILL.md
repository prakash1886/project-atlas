---
name: profile-regional-culture
description: Determine India / USA / Europe / Australia product preferences. Use when the Regional Culture agent must act on its inputs and produce its defined output.
metadata:
  agent: regional-culture
  source: Project Atlas Requirements §3.6
  layer: L6 Commerce
  host: vps
---

# profile-regional-culture

Determine India / USA / Europe / Australia product preferences.

## When to use
- When the Regional Culture agent is invoked in the L6 Commerce pipeline and its inputs are available.

## Inputs / Sources
Geographic Intelligence

## Output
Regional preference profile

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
