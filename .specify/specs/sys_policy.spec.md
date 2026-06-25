# Feature Specification: API Governance & Policy Compliance (SYS-POLICY)

## 1. Overview & Goal
A governance layer over every external data API used by the agents. It enforces provider Terms of
Service and rate limits as code, meters and caps cost, and continuously watches provider policy pages
so the rules the agents follow never drift out of date. First providers: **Brave Search** and **Exa**.

## 2. Researched provider facts (2026-06-23, drives the manifests)
- **Brave**: $5 / 1k requests, $5/mo credit (~1,000 free), 50 QPS (Search plan). **No storage rights on
  standard/$5 plans** — storing results requires a plan that explicitly grants it. POI ids expire ~8h.
- **Exa**: Search $7/1k (≤10 results, +$1/1k per extra 10); Contents $1/1k pages; Deep/Reasoning $12–15/1k.
  Free tier 20,000 requests/mo. Rate limits: `/search` 10 QPS, `/contents` 100 QPS, `/answer` 10 QPS.

## 3. User Stories
- **As the platform owner**: I want EVERY provider hard-capped at its free-tier ceiling with zero paid
  overage by default, so the system never bleeds cost — an agent loop can never run up a bill.
- **As a Compliance reviewer**: I want result bodies never stored on a non-storage-rights plan, so we
  don't breach Brave's terms.
- **As an agent**: I want the current do/don't rules injected into my prompt, so I respect attribution,
  storage, and query-budget limits without re-deriving them.
- **As an operator**: when a provider changes its ToS or pricing, I want to be alerted with a plain-language
  summary and a proposed config diff to approve — not a silent auto-change.

## 4. Functional Requirements
- **Policy manifest**: version-pinned per-provider file is the single source of enforcement truth. (F-001, F-002)
- **Signals-only caching** by default; full-body cache only when `storageRights: true`. (F-003, F-004)
- **Adaptive rate limiting**: honor documented QPS + `X-RateLimit-*` / `Retry-After`; backoff + circuit breaker. (F-005, F-006)
- **Cost ledger + caps**: log every call with estimated cost; **zero paid overage by default** —
  kill-switch at the free-tier ceiling (with safety margin) + alert; per-run sub-quotas; atomic
  reserve-before-call counter. (F-007, F-008, F-009, F-009a)
- **Drift watch**: scheduled fetch + hash-diff of provider pages. (F-010)
- **Human-gated interpretation**: interpreter agent proposes; person approves; version bump + hot-reload. (F-011, F-012)

## 5. Edge Cases
- **Manifest missing/corrupt** → SearchService falls back to the most conservative built-in limits and refuses full-body caching.
- **Watcher false-positive diff** (cosmetic page change) → interpreter classifies as no-op; still logged, no rule change.
- **Provider page unreachable** → watcher retries with backoff, flags "stale policy (N days)" after a threshold.
- **Cap hit mid-workflow** → in-flight results from cache still served; new outbound calls suppressed until reset.

## 6. Acceptance Criteria
- `search_cache` contains no Brave/Exa result bodies while `storageRights:false`.
- Exceeding the monthly cap halts outbound calls and emits a dashboard alert.
- A changed ToS hash produces a proposed diff that cannot apply without an approval record.
