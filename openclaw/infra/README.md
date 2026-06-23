# Atlas VPS Inference Infrastructure (spec §11.3)

Two CPU services on the Hostinger VPS that sit in front of the LLM providers.

## LiteLLM — unified gateway (`:4000`, loopback)
One OpenAI-compatible endpoint routing to DeepSeek + Gemini, so every agent uses a single
base URL + key, with provider fallbacks, retries, and `drop_params` (auto-strips
provider-unsupported fields like OpenAI's `store`, which Gemini rejects).

- venv: `/opt/litellm/venv` · config: `/opt/litellm/config.yaml` ([config.yaml](litellm/config.yaml))
- service: `litellm.service` → `http://127.0.0.1:4000`
- auth: master key in `/etc/atlas-llm.env` (`LITELLM_MASTER_KEY`, not in git)
- models: `deepseek-chat`, `deepseek-reasoner`, `gemini-2.5-flash`, `gemini-2.5-pro`
- test: `curl -s :4000/v1/models -H "Authorization: Bearer $LITELLM_MASTER_KEY"`

## LLMLingua-2 — prompt compression (`:8200`, loopback)
CPU prompt compressor for input-heavy agents (trend/research/scientists). Compresses the
dynamic part of a prompt before send (~2–2.4× on prose), cutting input tokens.

- venv: `/opt/llmlingua/venv` · app: `/opt/llmlingua/server.py` ([server.py](llmlingua/server.py))
- model: `microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank` (light, CPU)
- service: `llmlingua.service` → `http://127.0.0.1:8200`
- API: `POST /compress {prompt, rate}` → `{compressed_prompt, origin_tokens, compressed_tokens, ratio}`; `GET /health`

## Install / re-install
```bash
# stage infra/ to the VPS, then on the VPS:
DEEPSEEK_API_KEY=... GEMINI_API_KEY=... bash infra/install-infra.sh
```
[install-infra.sh](install-infra.sh) is idempotent (reuses existing venvs). Secrets are read
from the environment and written to `/etc/atlas-llm.env` (chmod 600) — never committed.

## Wiring (done — `wire-openclaw.sh`)
All OpenClaw traffic now routes through LiteLLM, and input-heavy agents compress via LLMLingua.
Re-apply with `bash infra/wire-openclaw.sh` on the VPS. What it does:

- **All 57 agents → LiteLLM**: the existing `deepseek-direct`/`gemini-direct` providers are
  repointed at `http://127.0.0.1:4000` (so no per-agent edits needed), plus a canonical
  `litellm` provider is added and set as `agents.defaults.model` (`litellm/deepseek-chat`,
  fallback `litellm/gemini-2.5-flash`). Verified: LiteLLM journal shows `POST /chat/completions 200`.
- **LLMLingua compression** via the [`custom_compress.py`](litellm/custom_compress.py) pre-call
  hook + `*-compressed` model variants. 15 input-heavy agents (trend-discovery, demand-forecast,
  coverage-gap, fact-verification, knowledge-graph, research-factcheck, hidden-legends, and the
  8 DS-Star scientists) use `litellm/{deepseek-chat,gemini-2.5-flash}-compressed`. Output-heavy
  (hook/vibe/narrative/script) and Pro-tier reasoning agents are intentionally left uncompressed
  (spec §11.3). The hook compresses only the last user message, never the cached system prefix,
  and fails open. Verified: agent turn logged `[llmlingua] 92->43 tok (2.1x)`.
