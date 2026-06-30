---
name: organize-playlists-creator
description: Focus on sourcing, drafting, and creative selection for: Organize stories into content universes / playlists (e.g. Sports Psychology, Leadership Psychology). Use when the Playlist Intelligence Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: playlist-intelligence-creator
  source: Project Atlas Requirements §3.4
  layer: L4 Audience
  host: vps
---

# organize-playlists-creator

Focus on sourcing, drafting, and creative selection for: Organize stories into content universes / playlists (e.g. Sports Psychology, Leadership Psychology).

## When to use
- When the Playlist Intelligence Creator agent is invoked in the L4 Audience pipeline and its inputs are available.

## Inputs / Sources
Archetype + Theme data. Use the `vidiq` MCP server's `vidiq_trend_categories` and
`vidiq_similar_channels` tools to validate that a proposed content universe/playlist theme
corresponds to a real, coherent audience cluster rather than an arbitrary grouping. vidiq is
the prioritized subscription; fall back to `nexlev` only if vidiq can't answer the lookup.

## Output
Draft proposal and creative options for: Playlist assignments

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
