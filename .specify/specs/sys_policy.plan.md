# Technical Plan: API Governance & Policy Compliance (SYS-POLICY)

## 1. System Architecture
```
 provider-policies/<provider>.policy.json   ← version-pinned manifest (git = audit trail)
        │  (loaded + watched)
        ▼
 [ PolicyService ] ──► enforcement params (rate, cap, cacheMode, rules)
   │            │
   ▼            ▼
 [ SearchService ]   [ Agents (respect-api-policy skill injects plain-language rules) ]
   │  - signals-only cache (unless storageRights)
   │  - adaptive throttle (X-RateLimit/Retry-After) + circuit breaker
   │  - api_usage_ledger write + monthly cap kill-switch
   ▼
 [ Brave / Exa APIs ]

 Scheduled drift loop (Temporal):
   policyWatchWorkflow → fetch pricing+ToS (Jina) → hash diff → IF changed →
     policy-interpreter agent (Gemini) → proposed manifest diff + risk flag →
     HUMAN APPROVAL (Operator Dashboard) → version bump + hot-reload
```

## 2. Technical Decisions (with the locked choices)
- **Cache = signals-only** (decision): `SearchService.writeCache` stores only `{source, query_hash,
  metric, value, fetched_at}` — never titles/urls/snippets — while `storageRights:false`. Brave $5 plan
  and Exa free tier are both `false`. (F-003/F-004)
- **Budget caps — zero paid overage, all providers** (decision): every provider is hard-capped at its
  free-tier/credit ceiling with a safety margin (~90–95%) to absorb concurrency. Brave = **900 / 1,000**
  free-credit requests, Exa = **19,000 / 20,000** free requests. `allowPaidOverage` defaults `false`;
  flipping it to `true` per provider is the only way to spend a cent. Counter is an atomic Redis
  reserve-before-call so concurrent agents can't collectively overshoot. Kill-switch → cache/stub + alert. (F-008/F-009a)
- **Generalizes to future sources** (YouTube 10k units/day, NewsAPI, Reddit, Jina, etc.): each gets a
  manifest entry with its free-tier cap and `allowPaidOverage:false` — the same kill-switch governs all.
- **Drift = human-approval gate** (decision): the interpreter never auto-applies; approval is required for
  all changes, numeric or legal. (F-011)
- **Adaptive throttle**: replace the fixed 30/min with per-provider QPS from the manifest, reading
  `X-RateLimit-Remaining` / `Retry-After`; exponential backoff + jitter; open circuit on 3 consecutive 429/401.
- **Rules → agents**: a shared `respect-api-policy` skill renders the manifest's `agentRules[]` into the
  prompt of every search-using agent, so interpretation is centralized and current.

## 3. Database & Schema Changes
```sql
-- signals-only cache: replace body storage; keep the 30-day no-repeat gate
ALTER TABLE search_cache DROP COLUMN IF EXISTS response;
ALTER TABLE search_cache ADD COLUMN IF NOT EXISTS metric VARCHAR(32);
ALTER TABLE search_cache ADD COLUMN IF NOT EXISTS value  NUMERIC;

CREATE TABLE IF NOT EXISTS api_usage_ledger (
  id           SERIAL PRIMARY KEY,
  provider     VARCHAR(16)  NOT NULL,
  endpoint     VARCHAR(32)  NOT NULL,
  request_count INTEGER     NOT NULL DEFAULT 1,
  est_cost_usd NUMERIC(10,5) NOT NULL DEFAULT 0,
  day          DATE         NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

## 4. File Structure
- `[NEW]` `provider-policies/brave.policy.json`, `provider-policies/exa.policy.json` (version-pinned)
- `[NEW]` `server/src/modules/search/policy/policy.service.ts` — load/validate manifest, expose enforcement params
- `[EDIT]` `search.service.ts` — signals-only `writeCache`, manifest-driven throttle, ledger write, cap kill-switch
- `[EDIT]` `database.module.ts` — `search_cache` signals columns + `api_usage_ledger`
- `[NEW]` `temporal/activities/policy-watch.activities.ts` + `workflows/policy-watch.workflow.ts` (scheduled)
- `[NEW]` `openclaw/agents/policy-interpreter/` + `openclaw/skills/{interpret-provider-policy,respect-api-policy}/`
- `[EDIT]` Operator Dashboard — budget + policy-change alert surface (reuse spec F-005 notification path)

## 5. Verification & Test Plan
- Inspect `search_cache` after a live Brave/Exa run → assert zero result bodies present.
- Force the monthly cap low → confirm outbound calls stop, cache/stub served, dashboard alert fired.
- Feed the watcher a mutated ToS fixture → confirm a proposed diff + risk flag are produced and that
  applying it requires an approval record (cannot auto-apply).
- `npx tsc -p tsconfig.server.json` compiles clean.
