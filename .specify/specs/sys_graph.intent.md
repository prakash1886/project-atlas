# Intent: Knowledge Graph (SYS-GRAPH)

## 1. Goals
Build a persistent, semantic database of entities and facts to supply agent swarms with rich context, avoiding generic LLM generation.

## 2. Constraints
- Must use PostgreSQL with `pgvector` to remain within a unified, relational database model for the MVP.
- Support up to 10M+ entities and 100M+ relationships.

## 3. Success Criteria
- Querying "Sachin Tendulkar" returns related nodes ("Glenn McGrath", "India") sorted by relationship strength and semantic proximity.
