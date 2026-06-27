#!/usr/bin/env bash
# Deploy Project Atlas OpenClaw agents + skills to the Hostinger VPS (spec §11.1).
# Run from a machine with SSH access to the VPS. Idempotent-ish: re-running re-installs skills.
set -uo pipefail

HOST="${ATLAS_VPS_HOST:-root@187.127.185.46}"
KEY="${ATLAS_VPS_KEY:-$HOME/.ssh/openclaw_vps}"
SSH="ssh -n -i $KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o BatchMode=yes"
SRC="$(cd "$(dirname "$0")" && pwd)"          # local openclaw/ dir
REMOTE="/root/atlas-openclaw"                   # staging dir on the VPS

# Required for the hermes-bridge MCP server (openclaw -> Hermes's Railway API).
# No safe default -- fail loudly rather than silently deploying a bridge that
# can never authenticate against Hermes.
: "${HERMES_BASE_URL:?Set HERMES_BASE_URL to Hermes's Railway URL before running deploy.sh}"
: "${DSSTAR_API_KEY:?Set DSSTAR_API_KEY (same value Hermes's Railway env uses) before running deploy.sh}"

# Required for the temporal-bridge MCP server (openclaw -> shared Temporal cluster).
: "${TEMPORAL_ADDRESS:?Set TEMPORAL_ADDRESS to the shared Temporal cluster before running deploy.sh}"
: "${TEMPORAL_ENCRYPTION_KEY:?Set TEMPORAL_ENCRYPTION_KEY (same value the NestJS/Hermes Temporal workers use) before running deploy.sh}"

# agent id | model | emoji | display name | comma-separated skills
AGENTS=(
  "chief-editor|gemini-direct/gemini-2.5-flash|🎬|Chief Editor|orchestrate-content-run,submit-editorial-review,dispatch-hermes-content-run"
  "content-factory|deepseek-direct/deepseek-chat|🏭|Content Factory|select-vibe,direct-voice,plan-assets,generate-thumbnails"
  "trend-intelligence|deepseek-direct/deepseek-chat|📈|Trend Intelligence|fetch-signals,calculate-opportunity-score"
  "knowledge-graph|deepseek-direct/deepseek-chat|🕸️|Knowledge Graph Curator|query-semantic-nodes,autolink-entities"
  "research-factcheck|deepseek-direct/deepseek-chat|🔎|Research & Fact-Check|gather-citations,verify-claims"
  "narrative-psychology|gemini-direct/gemini-2.5-flash|🎭|Narrative & Psychology|generate-psych-profile,draft-video-script"
  "commerce-design|deepseek-direct/deepseek-chat|🛍|Commerce & Design|generate-design-prompt,audit-trademark-compliance"
  "ds-star|gemini-direct/gemini-2.5-flash|📊|DS-Star|forecast-retention,optimize-scoring-weights"
)

# Agents that need the hermes-bridge MCP tool (run_judgment_agent/start_content_run/
# get_content_run_status) to actually reach Hermes -- everyone else has no reason to.
HERMES_BRIDGE_AGENTS=("chief-editor" "content-factory" "ds-star")

# Agents that need direct Temporal-client access (start/signal/query any workflow
# on the shared cluster), not just Hermes's HTTP surface -- ds-star to kick the
# nightly/weekly TS scientist workflows on demand, chief-editor as the prerequisite
# for a future real HITL signal replacing submit-editorial-review's placeholder.
TEMPORAL_BRIDGE_AGENTS=("ds-star" "chief-editor")

echo ">> staging skills + personas + mcp bridges to $HOST:$REMOTE"
$SSH "$HOST" "mkdir -p $REMOTE"
scp -i "$KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r \
    "$SRC/skills" "$SRC/agents" "$SRC/agents.manifest.json" "$SRC/deploy-list.txt" "$SRC/mcp" "$HOST:$REMOTE/" >/dev/null
$SSH "$HOST" "pip3 install -q -r '$REMOTE/mcp/hermes-bridge/requirements.txt'"
$SSH "$HOST" "pip3 install -q -r '$REMOTE/mcp/temporal-bridge/requirements.txt'"

deploy_one() {   # id model emoji name skills_csv
  local id="$1" model="$2" emoji="$3" name="$4" skills="$5"
  local ws="/root/.openclaw/atlas/$id"
  echo ">> agent: $id ($model)"
  $SSH "$HOST" "openclaw agents add '$id' --workspace '$ws' --model '$model' --non-interactive >/dev/null 2>&1 || true; \
                mkdir -p '$ws' && cp '$REMOTE/agents/$id/SOUL.md' '$ws/SOUL.md'; \
                openclaw agents set-identity --agent '$id' --name '$name' --emoji '$emoji' >/dev/null 2>&1 || true"
  IFS=',' read -ra SK <<< "$skills"
  for s in "${SK[@]}"; do
    $SSH "$HOST" "openclaw skills install '$REMOTE/skills/$s' --agent '$id' --force >/dev/null 2>&1 && echo '   + $s' || echo '   ! $s FAILED'"
  done
}

echo "== 8 hand-authored swarm/executive coordinators =="
for row in "${AGENTS[@]}"; do
  IFS='|' read -r id model emoji name skills <<< "$row"
  deploy_one "$id" "$model" "$emoji" "$name" "$skills"
done

echo "== granular catalog (deploy-list.txt) =="
while IFS='|' read -r id model emoji name host skill; do
  [ -z "$id" ] && continue
  deploy_one "$id" "$model" "$emoji" "$name" "$skill"
done < "$SRC/deploy-list.txt"

echo "== registering hermes-bridge MCP tool =="
for id in "${HERMES_BRIDGE_AGENTS[@]}"; do
  $SSH "$HOST" "openclaw mcp add hermes-bridge \
                  --command 'python3 $REMOTE/mcp/hermes-bridge/server.py' \
                  --env HERMES_BASE_URL='$HERMES_BASE_URL' \
                  --env DSSTAR_API_KEY='$DSSTAR_API_KEY' \
                  --agent '$id' >/dev/null 2>&1 && echo '   + hermes-bridge -> $id' || echo '   ! hermes-bridge -> $id FAILED'"
done

echo "== registering temporal-bridge MCP tool =="
for id in "${TEMPORAL_BRIDGE_AGENTS[@]}"; do
  $SSH "$HOST" "openclaw mcp add temporal-bridge \
                  --command 'python3 $REMOTE/mcp/temporal-bridge/server.py' \
                  --env TEMPORAL_ADDRESS='$TEMPORAL_ADDRESS' \
                  --env TEMPORAL_ENCRYPTION_KEY='$TEMPORAL_ENCRYPTION_KEY' \
                  --agent '$id' >/dev/null 2>&1 && echo '   + temporal-bridge -> $id' || echo '   ! temporal-bridge -> $id FAILED'"
done

echo ">> restart gateway + summary"
$SSH "$HOST" "openclaw gateway restart >/dev/null 2>&1; sleep 5; openclaw agents list 2>&1 | head -30"
echo ">> done"
