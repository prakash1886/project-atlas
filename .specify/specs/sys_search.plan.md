# Technical Plan: Search Intelligence (SYS-SEARCH)

## 1. System Architecture
```
 [ OpenClaw Agent (VPS) ]
      │
      ├── (agent search via MCP) ──> [ Brave MCP + Exa MCP servers ] ──> api.search.brave.com / api.exa.ai
      │
 [ Temporal trend pipeline / fetch_signals ]
      │
      └── (cached + throttled) ────> [ SearchService (NestJS) ] ──> same provider APIs
                                          │
                          Redis rate-limiter (F-007) + search_cache 30-day gate (F-006)
```
Two consumers, one credential set, one cache. Agents get low-volume LLM-gated MCP access; the
high-volume deterministic poller goes through SearchService so SYS-TREND F-003 (Redis throttle) and
§6.2 (30-day cache) are enforced — neither of which raw MCP can provide.

## 2. Technical Decisions
- **Dual path, mirroring SYS-ENVATO** (MCP for agents + NestJS service for programmatic calls).
- **Brave Search MCP** (`@brave/brave-search-mcp-server`, env `BRAVE_API_KEY`) and **Exa MCP**
  (`exa-mcp-server`, env `EXA_API_KEY`), registered via `openclaw mcp add` (`openclaw/infra/wire-search-mcp.sh`).
  `mcp add` probes the server before saving, so registration doubles as the connection test.
- **Direct env match**: `.env` already uses the MCP-conventional `BRAVE_API_KEY` / `EXA_API_KEY`, so
  the servers read them directly — no aliasing step.
- **MCP is global in OpenClaw** (`mcp.servers`) — all agents can call both servers; there is no
  per-agent grant. The map below is *usage guidance* (enforce with `--include`/`--exclude` if needed):
  - Brave: trend-discovery, trend-intelligence, coverage-gap, cultural-context, content-opportunity-scientist
  - Exa: coverage-gap, hidden-legends, psychological-arc, research-factcheck, hidden-legends-discovery-scientist
- **Temporal path**: `TrendSignalsActivities` (injects `SearchService`) exposes `fetchSignals` +
  `computeCoverageGap` activities, surfaced via the `coverageGapWorkflow` on the `ad-automation` queue.
- **Page cleaning** stays on Jina Reader (spec §11.3); SearchService stores only normalized signals
  and citation metadata, never full pages (copyright-safe, §2.5).

## 3. Database & Schema Changes
```sql
CREATE TABLE IF NOT EXISTS search_cache (
  source       VARCHAR(16)  NOT NULL,        -- 'brave' | 'exa'
  query        TEXT         NOT NULL,
  metric       VARCHAR(32)  NOT NULL,        -- signals-only (SYS-POLICY F-003): NO result bodies
  value        NUMERIC      NOT NULL,        -- derived signal (e.g. result_count)
  fetched_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  PRIMARY KEY (source, query)
);
-- 30-day no-repeat is a fetched_at predicate at read time (spec §6.2).
-- Storage compliance: result bodies are never persisted (Brave non-storage-rights plan) — see SYS-POLICY.
-- raw_signals (SYS-TREND F-002) receives the normalized {datetime, metric, value} rows.
```
Stubbed until the Railway Postgres backbone is wired (§2.3/§11.1), consistent with the other skills.

## 4. File Structure
- `[EDIT]` [.mcp.json](file:///d:/Project%20Atlas/.mcp.json) — add `brave-search` + `exa` servers (env `${BRAVE_API_KEY}` / `${EXA_API_KEY}`)
- `[NEW]`  [wire-search-mcp.sh](file:///d:/Project%20Atlas/openclaw/infra/wire-search-mcp.sh) — register both MCP servers on the VPS, grant per the map
- `[NEW]`  [search.module.ts](file:///d:/Project%20Atlas/server/src/modules/search/search.module.ts)
- `[NEW]`  [search.service.ts](file:///d:/Project%20Atlas/server/src/modules/search/search.service.ts) — `braveSearch()` / `exaSearch()`, Redis throttle, `search_cache` gate, stub fallback
- `[NEW]`  [trend-signals.activities.ts](file:///d:/Project%20Atlas/server/src/modules/temporal/activities/trend-signals.activities.ts) — Temporal `fetchSignals` + `computeCoverageGap` over SearchService
- `[NEW]`  [trend-signals.workflow.ts](file:///d:/Project%20Atlas/server/src/modules/temporal/workflows/trend-signals.workflow.ts) — `coverageGapWorkflow` (ranks personalities by demand-vs-supply gap)
- `[EDIT]` SKILL.md docs (fetch-signals, gather-citations, find-coverage-gaps, discover-trends,
  discover-hidden-legends, extract-psychological-arc) — replace "keys not present yet" with the live
  Brave/Exa MCP tools + SearchService path

## 5. Verification & Test Plan
- `curl` Brave (`/res/v1/web/search`) and Exa (`/search`) with the `.env` keys → confirm 200 + parse shape.
- `npm run build` (server compiles with the new module).
- `openclaw agents list` / agent introspection → Brave/Exa tools present on mapped agents only.
- End-to-end: Coverage Gap run returns a non-stub `{personality, interest_score, coverage_score,
  gap_score}`; a repeated in-window query makes zero outbound calls.
