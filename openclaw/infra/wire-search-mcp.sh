#!/usr/bin/env bash
# Register the Brave + Exa search MCP servers into OpenClaw (SYS-SEARCH F-003). Run ON the VPS.
# Idempotent. Reads keys from /etc/atlas-llm.env (same store as LITELLM_MASTER_KEY).
#
# OpenClaw model (verified on 2026.6.9): `openclaw mcp add` probes the server BEFORE saving, so a
# successful save == a successful connection test. MCP servers are GLOBAL (mcp.servers) — every
# agent can call them; there is no per-agent grant. To scope tools, use `--include` / `--exclude`.
#
# Add these to /etc/atlas-llm.env first:
#   BRAVE_API_KEY=...
#   EXA_API_KEY=...
set -uo pipefail

ENV_FILE="${ATLAS_LLM_ENV:-/etc/atlas-llm.env}"
BRAVE_KEY=$(grep -E '^BRAVE_API_KEY=' "$ENV_FILE" | cut -d= -f2-)
EXA_KEY=$(grep -E '^EXA_API_KEY=' "$ENV_FILE" | cut -d= -f2-)

if [ -z "$BRAVE_KEY" ] || [ -z "$EXA_KEY" ]; then
  echo "!! BRAVE_API_KEY / EXA_API_KEY missing from $ENV_FILE — aborting" >&2
  exit 1
fi

echo "== add brave-search MCP (probes before saving) =="
openclaw mcp add brave-search \
  --command npx --arg -y --arg @brave/brave-search-mcp-server \
  --env BRAVE_API_KEY="$BRAVE_KEY"

echo "== add exa MCP (probes before saving) =="
openclaw mcp add exa \
  --command npx --arg -y --arg exa-mcp-server \
  --env EXA_API_KEY="$EXA_KEY"

echo "== verify: list + live probe =="
openclaw mcp list
openclaw mcp probe        # expected: brave-search ~8 tools, exa ~2 tools + resources/prompts

echo "== reload so active agents pick up the new servers next turn =="
openclaw mcp reload

# Usage guidance (not enforced — MCP is global):
#   Brave -> trend-discovery, trend-intelligence, coverage-gap, cultural-context, content-opportunity-scientist
#   Exa   -> coverage-gap, hidden-legends, psychological-arc, research-factcheck, hidden-legends-discovery-scientist
echo "== done =="
