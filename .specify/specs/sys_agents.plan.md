# Technical Plan: Agent Swarms & Orchestration (SYS-AGENTS)

## 1. System Architecture
```
[Chief Editor Agent] ➔ [Research Agent] ➔ [Fact Check Agent] ➔ [Story Agent]
        ▲                                                               │
        └─────────────────── [Quality Score < 90] ──────────────────────┘
```

## 2. Technical Decisions
- LangGraph TS/Python runtime coordinates agent steps.

## 3. Database & Schema Changes
```sql
CREATE TABLE IF NOT EXISTS agent_runs (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(250) NOT NULL,
    swarm_type VARCHAR(50) NOT NULL, -- RESEARCH, CONTENT
    status VARCHAR(20) NOT NULL, -- IN_PROGRESS, COMPLETED, FAILED
    cost_usd NUMERIC(6,4) DEFAULT 0.0000,
    tokens_used INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);
```

## 4. File Structure & Target Files
- `[NEW]` `server/src/modules/agents/agents.service.ts`
- `[NEW]` `server/src/modules/agents/agents.workflow.ts`

## 5. Verification & Test Plan
- Run state validation tests to verify max iterations constraints.
