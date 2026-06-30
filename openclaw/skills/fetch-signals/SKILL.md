---
name: fetch-signals
description: Query Google Trends, Reddit, YouTube, news and Wikipedia pageviews to retrieve raw volume and velocity statistics for a topic. Use when the Trend Intelligence agent needs fresh trend/discussion/search signals for a query or topic. Always fetch source text via Jina Reader and respect the search_cache 30-day no-repeat rule.
metadata:
  agent: trend-intelligence
  source: Project Atlas Agent Skills Manifest §2
  layer: L1-trend
---

# fetch-signals

Harvest real-time demand signals from external sources for a given query/topic.

## When to use
- Daily trend-discovery sweep, or on a real signal change (news event, pageview spike).
- A topic needs current volume/velocity before scoring.

## Sources (spec §5.5 mapping)
- **Brave Search** (live) via the `brave-search` MCP server — call it directly for web volume.
  High-volume deterministic polling instead routes through the NestJS `SearchService`, which adds the
  `search_cache` 30-day gate + Redis rate limiter (SYS-SEARCH).
- **News** (live) via `SearchService`'s `currents` source (Currents API, primary) — confirmed working,
  1,000 req/day free tier, daily-reset cap. `freenews` (FreeNewsApi.io) is registered as a secondary/
  fallback source but was unresponsive in live testing (server accepts the connection, never replies);
  treat it as best-effort, not primary.
- YouTube Data API + Reddit + Google Trends + GDELT — **still not implemented**, no client exists for
  any of these despite being listed here historically. Don't rely on this skill for those signals yet.
- **Wikipedia Pageviews** for spike detection — also not implemented yet.
- Fetch & clean page text with **Jina Reader** (avoids headless browser on the VPS, spec §11.3).

## Function signature (manifest contract)
```python
def fetch_signals(source: str, query: str) -> list:
    """Return raw metric signals mapped by datetime."""
```

## Inputs / Outputs
- **Input:** `source` — must be one of `SearchService`'s real `SearchSource` values:
  `brave`, `exa`, `currents`, `freenews` (NOT the `google_trends|reddit|youtube|news|wikipedia`
  labels this doc used to list -- those aren't real source identifiers at the implementation
  level; `currents`/`freenews` are what to pass for a news signal), `query`.
- **Output:** list of `{datetime, metric, value}` raw signals.

## Cost discipline (spec §6)
- Enforce `search_cache` 30-day no-repeat per query; only re-query on a real signal change.
- Batch multiple candidate queries per call where possible.

## Implementation
Call the `temporal-bridge` MCP tool `start_workflow("fetchSignalsWorkflow", "trend-signals", [{"source": source, "query": query}])`, then poll `get_workflow_result(workflow_id)`. Runs the already-implemented `fetchSignals` Temporal activity (`server/src/modules/temporal/activities/trend-signals.activities.ts`), which goes through the cached, rate-limited `SearchService` (the `search_cache` 30-day gate + Redis limiter apply automatically).

## Backend dependency
- `search_cache` is implemented (DatabaseModule); `youtube_topics/_trends` tables (Railway) — **stubbed** until wired.
- API keys: **Brave and Currents are live** (`BRAVE_API_KEY`, `CURRENTS_API_KEY`, via SearchService, SYS-SEARCH).
  `FREENEWS_API_KEY` is also set but the provider itself is unresponsive (see Sources above).
  YouTube, Reddit, Google Trends, Wikipedia still pending -- no client exists for any of them. Jina key is available (`JINA_API`).

## Model
deepseek-direct/deepseek-chat (cheap, high-volume). Output must be schema-only JSON (spec §11.3).
