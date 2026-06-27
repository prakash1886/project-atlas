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

## Implementation
Call the `temporal-bridge` MCP tool `start_workflow("autolinkEntitiesWorkflow", "knowledge-graph", [{"entity_id": entity_id}])`, then poll `get_workflow_result(workflow_id)`. Reads the entity + its existing `relationships` rows and nearby candidates (via `query-semantic-nodes`) from the live Railway Postgres graph, then one LLM call proposes typed edges restricted to the vocabulary above (`server/src/modules/graph/graph.service.ts`'s `autolinkEntities`). Returns suggestions only -- does **not** write to `relationships` itself; a human/Curator must approve and persist them separately, per the existing rule below.

## Backend dependency
- Implemented as plain Postgres `entities`/`relationships` tables (live on Railway), not the Apache AGE
  extension this skill's description originally assumed -- the spec (`sys_graph.spec.md`) only requires
  node/edge CRUD + vector lookup + edge suggestion, which this schema already satisfies.

## Model
deepseek-direct/deepseek-chat to read a summary and propose typed edges; the human/Curator
approves before persisting. Output schema-only JSON.
