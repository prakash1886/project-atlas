---
name: gatekeep-opportunity-creator
description: Focus on sourcing, drafting, and creative selection for: Final gatekeeper above all agents: decide if a personality is worth covering, estimate whether it can generate 50+ stories, identify which audiences/countries care, assess YouTube saturation, shareability and retention likelihood. Use when the Story Opportunity Intelligence Creator agent must act on its inputs and produce its defined output.
metadata:
  agent: story-opportunity-intelligence-creator
  source: Project Atlas Requirements §3.7
  layer: Executive
  host: vps
---

# gatekeep-opportunity-creator

Focus on sourcing, drafting, and creative selection for: Final gatekeeper above all agents: decide if a personality is worth covering, estimate whether it can generate 50+ stories, identify which audiences/countries care, assess YouTube saturation, shareability and retention likelihood.

## When to use
- When the Story Opportunity Intelligence Creator agent is invoked in the Executive pipeline and its inputs are available.

## Inputs / Sources
Outputs of all discovery/intelligence agents. To assess YouTube saturation concretely (not
just from upstream judgment), use the `vidiq` MCP server's `vidiq_youtube_search` and
`vidiq_channel_search` to check how much existing coverage a personality/topic already has
before deciding go/no-go. vidiq is the prioritized subscription; fall back to `nexlev` only
if vidiq can't answer the lookup.

## Output
Draft proposal and creative options for: {go_no_go, can_generate_50plus, target_regions, saturation, rationale}

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
gemini-direct/gemini-2.5-flash — Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input.
