# Project Atlas — OpenClaw Agents & Skills

Source-of-truth definitions for the agents that run on the **OpenClaw orchestration bucket**
(Hostinger VPS, spec §11.1). Authored from the
[Project Atlas Agent Skills Manifest](../Project%20Atlas%20Agent%20Skills%20Manifest.md).

Each agent is an isolated OpenClaw agent (own workspace + model + auth); each agent's
capabilities are delivered as OpenClaw **skills** (`SKILL.md` packages) installed into its
workspace and listed in [`agents.manifest.json`](agents.manifest.json).

## Layout

```
openclaw/
  agents.manifest.json     # agent -> model + skill list (the link)
  agents/<agent>/
    IDENTITY.md            # name/role identity
    SOUL.md                # operating persona + workflow (system prompt)
  skills/<skill>/
    SKILL.md               # capability: when-to-use, I/O, function signature, backend deps
  deploy.sh                # creates agents + installs skills on the VPS
```

## Agents (7)

| Agent | Model | Skills | Spec layer |
|-------|-------|--------|------------|
| chief-editor | gemini-direct/gemini-2.5-flash | orchestrate-content-run, submit-editorial-review | Executive |
| trend-intelligence | deepseek-direct/deepseek-chat | fetch-signals, calculate-opportunity-score | L1 Trend |
| knowledge-graph | deepseek-direct/deepseek-chat | query-semantic-nodes, autolink-entities | Executive/Memory |
| research-factcheck | deepseek-direct/deepseek-chat | gather-citations, verify-claims | L5 Content (verify) |
| narrative-psychology | gemini-direct/gemini-2.5-flash | generate-psych-profile, draft-video-script | L3/L5 |
| commerce-design | deepseek-direct/deepseek-chat | generate-design-prompt, audit-trademark-compliance | L6 Commerce |
| ds-star | gemini-direct/gemini-2.5-flash | forecast-retention, optimize-scoring-weights | Executive (runs on Railway in prod) |

Model tiers follow spec §2.4 / §11.3: DeepSeek = cheap high-volume workhorse,
Gemini = premium reasoning/judgment.

## Backend dependencies (not yet wired)

Skills that read/write durable state (knowledge-graph, ds-star, parts of trend/research)
depend on the Railway Postgres + Apache AGE + PGVector + Temporal backbone (§11.1/§2.3) and
on Jina for embeddings/retrieval. Those calls are marked `BACKEND DEPENDENCY` in each
`SKILL.md` and are stubbed until the backbone is connected. LLM-backed steps work today via
the configured DeepSeek/Gemini providers.

## Deploy

```bash
bash openclaw/deploy.sh            # run from a machine with SSH access to the VPS
```
See `deploy.sh` for the per-agent `agents add` + `skills install` commands.
