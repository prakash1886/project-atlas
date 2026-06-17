# Technical Plan: Knowledge Graph (SYS-GRAPH)

## 1. System Architecture
```
[Agent/API] ➔ [Graph Service] ➔ [PostgreSQL + pgvector]
```

## 2. Technical Decisions
- Use OpenAI `text-embedding-3-small` (1536 dimensions) for entity vector definitions.

## 3. Database & Schema Changes
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS entities (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(250) NOT NULL,
    type VARCHAR(50) NOT NULL, -- PERSON, EVENT, CONCEPT, COMPANY
    summary TEXT,
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS relationships (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(100) REFERENCES entities(id) ON DELETE CASCADE,
    target_id VARCHAR(100) REFERENCES entities(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- FACED, FOUNDED, INFLUENCED_BY
    weight NUMERIC(3,2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_id, target_id, type)
);
```

## 4. File Structure & Target Files
- `[NEW]` `server/src/modules/graph/graph.service.ts`
- `[NEW]` `server/src/modules/graph/graph.controller.ts`

## 5. Verification & Test Plan
- Verify that embedding insertion and retrieval runs in under 50ms using pgvector.
