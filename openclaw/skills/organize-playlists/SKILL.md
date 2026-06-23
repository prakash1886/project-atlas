---
name: organize-playlists
description: Organize stories into content universes / playlists (e.g. Sports Psychology, Leadership Psychology). Use when the Playlist Intelligence agent must act on its inputs and produce its defined output.
metadata:
  agent: playlist-intelligence
  source: Project Atlas Requirements §3.4
  layer: L4 Audience
  host: vps
---

# organize-playlists

Organize stories into content universes / playlists (e.g. Sports Psychology, Leadership Psychology).

## When to use
- When the Playlist Intelligence agent is invoked in the L4 Audience pipeline and its inputs are available.

## Inputs / Sources
Archetype + Theme data

## Output
Playlist assignments

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
