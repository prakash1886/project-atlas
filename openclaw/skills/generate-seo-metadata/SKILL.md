---
name: generate-seo-metadata
description: Draft a YouTube-optimized title, description, and tag list for a content run by calling Hermes's seo-metadata judgment agent, grounded in real keyword data via vidiq. Use when the Content Factory agent must produce the publish_metadata.title/description/tags that Hermes's content-run pipeline needs before dispatching to video-publish.
metadata:
  agent: content-factory
  source: Project Atlas Requirements §3.5/10.2
  layer: L5 Content Factory
  host: railway
---

# generate-seo-metadata

Draft a search-optimized title, description, and tag list for a content run.

## When to use
- Alongside `plan-assets`/`generate-thumbnails`, before dispatching to Hermes's content-run pipeline.

## Inputs / Sources
Script + hook + archetype context. Use the `vidiq` MCP server's `vidiq_keyword_research` tool
(mode: research) to ground the title's primary keyword and the tag list in real search-volume/
competition data, rather than guessing keywords from judgment alone. vidiq is the prioritized
subscription; fall back to `nexlev` only if vidiq can't answer the lookup.

## Output
`{title, description, tags}` (see `hermes/agents/seo-metadata/schema.json`) — this shape is
exactly what `ContentRunRequest.publish_metadata` expects for its `title`/`description`/`tags`
fields; `dispatch-hermes-content-run` assembles them in alongside `privacy_status` (which stays
chief-editor's own call, unrelated to SEO).

## Function signature (manifest contract)
```python
def generate_seo_metadata(script_text: str, hook: str, archetype_context: dict) -> dict:
    """Returns {"title": str, "description": str, "tags": [str, ...]}."""
```

## Implementation
Call the `hermes-bridge` MCP tool `run_judgment_agent(insight_type="seo-metadata", query=<ask>, context={"script_text": script_text, "hook": hook, **archetype_context})`. Hits `POST /v1/agents/seo-metadata` — same self-correcting loop / mock-fallback pattern, no new backend.

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3).
