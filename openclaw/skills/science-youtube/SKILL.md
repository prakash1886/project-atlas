---
name: science-youtube
description: Analyze CTR, watch time, retention, comments, likes and shares to find production-format insights (video length, best posting times by topic). Use when the YouTube Scientist agent must act on its inputs and produce its defined output.
metadata:
  agent: youtube-scientist
  source: Project Atlas Requirements §3.7
  layer: DS-Star Science
  host: railway
---

# science-youtube

Analyze CTR, watch time, retention, comments, likes and shares to find production-format insights (video length, best posting times by topic).

## When to use
- When the YouTube Scientist agent is invoked in the DS-Star Science pipeline and its inputs are available.

## Inputs / Sources
YouTube analytics

## Output
Format/timing insights

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — This agent's core work is statistical/deterministic — compute in Python at zero LLM cost; call the model only to interpret a result or resolve ambiguity (spec §11.3).
