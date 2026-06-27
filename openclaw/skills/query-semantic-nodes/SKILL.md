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

## Implementation
Call the `temporal-bridge` MCP tool `start_workflow("querySemanticNodesWorkflow", "knowledge-graph", [{"query_text": query_text, "limit": limit}])`, then poll `get_workflow_result(workflow_id)`. Runs the SQL above for real against the live Railway Postgres `entities` table (`server/src/modules/graph/graph.service.ts`'s `querySemanticNodes`), embedding `query_text` via `LlmService.generateEmbeddings()` (Modal-hosted `embeddinggemma-300m`, 300-dim — note this is **not** Jina; the embedding column is sized to match whatever model actually writes to it).

## Backend dependency
- **PGVector `entities` table on Railway** is live (`pgvector extension verified` in production), but
  only the two original seed rows (Sachin/McGrath) exist until `gather-citations`/`autolink-entities` or
  another caller starts calling `upsertEntity` to actually populate it. Results will be sparse until then.

## Model
No generative LLM for this skill itself — embedding + DB only.
