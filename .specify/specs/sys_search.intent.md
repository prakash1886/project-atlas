# Intent: Search Intelligence (SYS-SEARCH)

## 1. Goals
Give both autonomous agents and the deterministic trend pipeline first-class web and semantic
search. Brave supplies real-time web/news/search-volume signals; Exa supplies neural, long-tail
and biographical discovery. Together they replace the currently-stubbed `Brave + Exa` inputs that
the Coverage Gap, Trend, Hidden Legends, Psychological Arc and Research agents are already
specified to consume.

## 2. Constraints
- **Ban avoidance**: respect the `search_cache` 30-day no-repeat rule and Redis rate limiters; only
  re-query on a real signal change (SYS-TREND §6.2 / F-003). Direct, uncached polling is forbidden.
- **Credential safety**: `BRAVE_API` / `EXA_API` live in environment/secret storage only, never in
  git; a missing key degrades to a stub rather than crashing the swarm.
- **Page hygiene**: fetched result pages are cleaned via Jina Reader, never via a headless browser
  on the VPS (spec §11.3).
- **Cost discipline**: agent MCP search stays low-volume and LLM-gated; bulk polling is the
  server-side computation-first path (spec §11.3).

## 3. Success Criteria
- The Coverage Gap agent returns a real `{personality, interest_score, coverage_score, gap_score}`
  computed from live Brave + Exa data rather than a stub.
- The Research & Fact-Check agent resolves long-tail citations via Exa within the copyright-safe
  pipeline (facts/links only, never full articles).
- A repeated query inside the 30-day window is served from `search_cache` with zero outbound API
  calls.
