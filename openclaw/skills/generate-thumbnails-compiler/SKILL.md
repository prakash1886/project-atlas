---
name: generate-thumbnails-compiler
description: Focus on structural integrity, schemas, and format alignment for: Generate thumbnail concepts and image-generation prompts. Use when the Thumbnail Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: thumbnail-compiler
  source: Project Atlas Requirements §3.5
  layer: L5 Content Factory
  host: railway
---

# generate-thumbnails-compiler

Focus on structural integrity, schemas, and format alignment for: Generate thumbnail concepts and image-generation prompts.

## When to use
- When the Thumbnail Compiler agent is invoked in the L5 Content Factory pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Story + Hook

## Output
Compiled and formatted candidate structure for: Thumbnail prompts

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
