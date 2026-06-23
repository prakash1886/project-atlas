---
name: gather-citations
description: Query Wikipedia, Wikidata, news RSS, academic APIs and public-domain archives to synthesize facts and associate each with a verified source link. Use when the Research & Fact-Check agent must build a factual dossier for a topic before scriptwriting. Store only facts/events/dates/relationships and reference metadata — never full articles (copyright-safe pipeline, spec §2.5).
metadata:
  agent: research-factcheck
  source: Project Atlas Agent Skills Manifest §4
  layer: L5-content-verify
---

# gather-citations

Build a bulletproof, source-linked factual dossier.

## When to use
- A topic is approved for production and needs verified facts before narrative drafting.

## Sources (spec §5.2/§5.3/§5.5)
Wikipedia API, Wikidata, Crossref, Semantic Scholar, OpenAlex, NewsAPI, GDELT, Internet
Archive, Project Gutenberg; **Exa** for long-tail/hidden-legend discovery. Fetch & clean with **Jina Reader**.

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

## Backend dependency
- Writes facts/citations to the graph + `search_cache` (Railway). **Stubbed** until wired.
- API keys: Exa, NewsAPI (not present yet); Wikipedia/Wikidata/GDELT are keyless; Jina available.

## Model
deepseek-direct/deepseek-chat for extraction/synthesis. Heavy input → apply Jina Reader + prompt compression (spec §11.3).
