---
name: gather-citations
description: Query Wikipedia, Wikidata, Stack Exchange, public Discourse forums, academic APIs, and public-domain archives to synthesize facts, human struggles, and philosophical debates to build the narrative arc for a topic. Store only facts/events/dates/relationships, dialogic tension points, and reference metadata — never full articles (copyright-safe pipeline, spec §2.5).
metadata:
  agent: research-factcheck
  source: Project Atlas Agent Skills Manifest §4
  layer: L5-content-verify
---

# gather-citations

Build a bulletproof, source-linked factual dossier and narrative friction map.

## When to use
- A topic is approved for production and needs verified facts and narrative tension points before drafting.

## Sources (spec §5.2/§5.3/§5.5)
Wikipedia API, Wikidata, DBpedia, Crossref, Semantic Scholar, OpenAlex, NewsAPI, GDELT, Internet Archive, Project Gutenberg, Stack Exchange (Philosophy/History/Literature), public Discourse forums; **Exa** (live) via the `exa` MCP server — bulk polling routes through the NestJS `SearchService` (SYS-SEARCH). Fetch & clean with **Jina Reader**. Stack Exchange and Discourse are queried specifically to harvest the core human struggles, common questions, and debates surrounding the topic to build the story's narrative arc (not for trends).

## Function signature (manifest contract)
```python
def gather_citations(topic: str) -> dict:
    """Synthesize facts and associate each with a verified source link."""
```

## Inputs / Outputs
- **Input:** `topic`.
- **Output:** `{facts: [{claim, date?, source_url, source_type}], citations_count}`.

## Copyright-safe rule (spec §2.5)
Store only facts, events, dates, relationships and reference metadata. Never store or rewrite
full articles/books. Never use a single source as the sole source.

## Implementation
Call the `hermes-bridge` MCP tool `run_judgment_agent(insight_type="gather-citations", query=<ask>, context={"topic": topic})`. Hits Hermes's `POST /v1/agents/gather-citations` (new `hermes/agents/gather-citations/`), same self-correcting LLM loop / mock-fallback pattern. Caveat: this is LLM judgment from training-data knowledge, not live retrieval against Wikipedia/Wikidata/Exa yet -- treat the dossier as a first draft for a human fact-checker, the same caveat that already applies to `vibe`/`voice-director` today.

## Backend dependency
- Writing facts/citations to the graph (Railway) is still **stubbed** until the Postgres/AGE backbone is wired; `search_cache` is implemented (DatabaseModule).
- API keys: **Exa is live** (`EXA_API_KEY`, via the `exa` MCP server / SearchService, SYS-SEARCH) but not yet routed into this skill's judgment call -- a future improvement is feeding Exa search results into the `context` passed to `run_judgment_agent`.
  NewsAPI still pending; Wikipedia/Wikidata/GDELT are keyless; Jina available.

## Model
deepseek-direct/deepseek-chat for extraction/synthesis. Heavy input → apply Jina Reader + prompt compression (spec §11.3).
