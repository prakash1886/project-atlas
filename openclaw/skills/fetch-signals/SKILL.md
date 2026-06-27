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
- **Brave Search** (live) via the `brave-search` MCP server — call it directly for web/news volume.
  High-volume deterministic polling instead routes through the NestJS `SearchService`, which adds the
  `search_cache` 30-day gate + Redis rate limiter (SYS-SEARCH).
- YouTube Data API + Reddit + Google Trends + GDELT (real-time signals).
- **Wikipedia Pageviews** for spike detection.
- Fetch & clean page text with **Jina Reader** (avoids headless browser on the VPS, spec §11.3).

## Function signature (manifest contract)
```python
def fetch_signals(source: str, query: str) -> list:
    """Return raw metric signals mapped by datetime."""
```

## Inputs / Outputs
- **Input:** `source` (google_trends|reddit|youtube|news|wikipedia), `query`.
- **Output:** list of `{datetime, metric, value}` raw signals.

## Cost discipline (spec §6)
- Enforce `search_cache` 30-day no-repeat per query; only re-query on a real signal change.
- Batch multiple candidate queries per call where possible.

## Implementation
Call the `temporal-bridge` MCP tool `start_workflow("fetchSignalsWorkflow", "trend-signals", [{"source": source, "query": query}])`, then poll `get_workflow_result(workflow_id)`. Runs the already-implemented `fetchSignals` Temporal activity (`server/src/modules/temporal/activities/trend-signals.activities.ts`), which goes through the cached, rate-limited `SearchService` (the `search_cache` 30-day gate + Redis limiter apply automatically).

## Backend dependency
- `search_cache` is implemented (DatabaseModule); `youtube_topics/_trends` tables (Railway) — **stubbed** until wired.
- API keys: **Brave is live** (`BRAVE_API_KEY`, via the `brave-search` MCP server / SearchService, SYS-SEARCH).
  YouTube, Reddit still pending. Jina key is available (`JINA_API`).

## Model
deepseek-direct/deepseek-chat (cheap, high-volume). Output must be schema-only JSON (spec §11.3).
