---
name: autolink-entities
description: Scan an entity's summary/metadata and cross-reference the graph to suggest new edge relationships (FACED, INFLUENCED_BY, LED, RIVALED, MENTORED, etc.) in Apache AGE. Use when the Knowledge Graph agent must enrich the Human Story Graph after a new entity or source is added.
metadata:
  agent: knowledge-graph
  source: Project Atlas Agent Skills Manifest §3
  layer: memory
---

# autolink-entities

Propose and write new graph edges for an entity.

## When to use
- A new personality/source was added and its relationships are not yet modeled.
- Periodic graph-enrichment pass.

## Relationship types (spec §4.5)
`INSPIRED, RIVALED, FAILED, REINVENTED, LED, MENTORED, INFLUENCED, ACQUIRED`
e.g. `(RatanTata)-[:LED]->(TataGroup)`.

## Function signature (manifest contract)
```python
def autolink_entities(entity_id: str) -> list:
    """Cross-reference the graph and return suggested new edges for entity_id."""
```

## Inputs / Outputs
- **Input:** `entity_id`.
- **Output:** list of suggested edges `{from, type, to, confidence}`.

## Backend dependency — intentionally still blocked, not wired
- **Apache AGE graph on Railway Postgres** — read existing nodes/edges, write new ones. **Stubbed** until wired.
- **Why this isn't routed through an LLM judgment call as an interim measure**: there is no real graph
  to "cross-reference" yet -- an LLM proposing edges against a graph that doesn't exist would fabricate
  plausible-looking but fake relationships rather than real ones. Wait for the Postgres/AGE backbone
  (P5) rather than faking this one, same reasoning as `query-semantic-nodes`.

## Model
deepseek-direct/deepseek-chat to read a summary and propose typed edges; the human/Curator
approves before persisting. Output schema-only JSON.
