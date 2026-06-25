# Feature Specification: Search Intelligence (SYS-SEARCH)

## 1. Overview & Goal
Integrate the Brave Search API and the Exa API as the shared web + semantic search backbone for
Project Atlas. Two consumers share one credential set and one cache: OpenClaw **agents** call the
providers as **MCP tools**, while the **deterministic trend pipeline** calls them through a cached,
rate-limited **NestJS SearchService**. This realizes the `Brave + Exa` inputs already declared in
`atlas-agents.json` for Coverage Gap, Hidden Legends, Psychological Arc and the Research/Fact-Check
swarm.

## 2. User Stories
- **As the Coverage Gap Agent**: I want to compare Brave search-volume against Exa content-supply
  for a personality, so that I can compute a real `gap_score` for high-demand / low-supply topics.
- **As the Hidden Legends Agent**: I want Exa neural search over biographies and archives, so that
  I can surface fascinating low-coverage people before they go mainstream.
- **As the Research & Fact-Check Agent**: I want Exa long-tail discovery feeding `gather-citations`,
  so that I can build a source-linked dossier without storing full articles.
- **As the Trend pipeline**: I want bulk Brave/Exa polling to be cached and throttled, so that I
  collect 500M+ records/year without triggering API bans.

## 3. Functional Requirements
- **Brave Web/News Search**: SearchService + MCP route web and news queries to Brave. (F-001)
- **Exa Neural Search**: SearchService + MCP route semantic/long-tail queries to Exa. (F-002)
- **MCP Registration**: register Brave + Exa MCP servers into OpenClaw and grant each to its mapped
  agents. (F-003)
- **Credential Authorization**: read `BRAVE_API_KEY` / `EXA_API_KEY` from env; stub on absence. (F-004, F-005)
- **Cache Gate**: every query checks `search_cache` (30-day no-repeat) before any outbound call. (F-006)
- **Rate Limiting**: outbound calls pass through the Redis limiter. (F-007)
- **Consumer Split**: agents -> MCP; bulk polling -> SearchService; raw output normalized to
  `raw_signals`. (F-008, F-009)

## 4. Edge Cases
- **401 / 429 (expired key or rate limit)**: SearchService returns the last cached result if present,
  otherwise a stub, and logs for the operator — it never throws into the swarm.
- **Empty results**: the calling agent degrades gracefully (e.g. Coverage Gap treats zero supply as
  maximum gap, flagged low-confidence) rather than failing.
- **Credential rotation**: a rotated/invalid key surfaces as a 401 → handled by the cached-result /
  stub fallback above; the operator is alerted rather than the swarm crashing.

## 5. Acceptance Criteria
- SearchService compiles, gates on `search_cache`, throttles via Redis, and stubs on missing keys.
- `openclaw agents list` shows Brave/Exa MCP tools on the mapped agents only.
- A live Coverage Gap run returns a non-stub `gap_score`; a repeated query in-window makes zero API
  calls.
