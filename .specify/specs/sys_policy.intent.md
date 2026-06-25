# Intent: API Governance & Policy Compliance (SYS-POLICY)

## 1. Goals
Let Project Atlas agents consume third-party data APIs (Brave, Exa, and future sources) **without
risking bans, ToS violations, or runaway cost**, and keep that compliance current as providers change
their pricing and terms. Policy becomes code: a version-pinned manifest per provider drives runtime
enforcement, cost is metered against hard caps, and a scheduled watcher + human-approved interpreter
keep the manifest (and therefore agent behavior) aligned with the live terms.

## 2. Constraints
- **Storage rights**: never persist provider result bodies unless that provider's plan explicitly grants
  storage rights. Brave's $5 Search plan does NOT → caching is signals-only (derived metrics + query hash).
- **Legal interpretation is human-gated**: an LLM may summarize and propose ToS changes, but a person
  approves before any rule/manifest update is applied.
- **Fail safe, not open, on cost**: when a monthly cap is hit, degrade to cache/stub — never keep spending.
- **Auditability**: every policy change is a versioned, attributable git commit; every API call is ledgered.

## 3. Success Criteria
- A Brave/Exa run never stores result bodies on a non-storage-rights plan (verified by inspecting `search_cache`).
- Hitting the configured monthly cap stops outbound calls and raises an Operator Dashboard alert.
- A simulated ToS/pricing change is detected by the watcher, interpreted into a proposed manifest diff,
  and blocked from auto-applying until approved.
