---
name: query-semantic-nodes
description: Convert query text to an embedding and run a cosine-distance search over the PGVector entities table to find related nodes in the Human Story Graph. Use when the Knowledge Graph agent must retrieve semantically related entities/facts to feed a writing or research agent.
metadata:
  agent: knowledge-graph
  source: Project Atlas Agent Skills Manifest §3
  layer: memory
---

# query-semantic-nodes

Semantic recall over the entity graph via vector similarity.

## When to use
- A writing/research agent needs deep relational facts about a person/topic.
- Expanding a story universe from existing graph knowledge (cheaper than re-searching, spec §6.2).

## SQL (manifest §3)
```sql
SELECT name, type, summary, (embedding <=> $1) AS distance
FROM entities ORDER BY distance LIMIT $2;
```

## Function signature (manifest contract)
```python
def query_semantic_nodes(query_text: str, limit: int = 5) -> list:
    """Embed query_text (1536-dim) and cosine-search PGVector for related nodes."""
```

## Inputs / Outputs
- **Input:** `query_text`, `limit`.
- **Output:** list of `{name, type, summary, distance}`.

## Backend dependency — intentionally still blocked, not wired
- **PGVector `entities` table on Railway** — **stubbed** until backbone wired.
- Embeddings via **Jina Embedding API** (`JINA_API` available) instead of an LLM embedding endpoint (spec §11.3).
- **Why this isn't routed through an LLM judgment call as an interim measure**: this skill is a
  cosine-distance SQL query over real stored vectors -- there is no real PGVector `entities` table to
  query yet. An LLM "pretending" to do semantic graph recall would fabricate plausible-looking but
  fake related entities, which is worse than returning nothing. Wait for the Postgres/AGE/PGVector
  backbone (P5) rather than faking this one.

## Model
No generative LLM — embedding + DB only. Use Jina for the embedding step.
