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

## Backend dependency
- **PGVector `entities` table on Railway** — **stubbed** until backbone wired.
- Embeddings via **Jina Embedding API** (`JINA_API` available) instead of an LLM embedding endpoint (spec §11.3).

## Model
No generative LLM — embedding + DB only. Use Jina for the embedding step.
