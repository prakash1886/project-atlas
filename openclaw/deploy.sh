#!/usr/bin/env bash
# Deploy Project Atlas OpenClaw agents + skills to the Hostinger VPS (spec §11.1).
# Run from a machine with SSH access to the VPS. Idempotent-ish: re-running re-installs skills.
set -uo pipefail

HOST="${ATLAS_VPS_HOST:-root@187.127.185.46}"
KEY="${ATLAS_VPS_KEY:-$HOME/.ssh/openclaw_vps}"
SSH="ssh -n -i $KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o BatchMode=yes"
SRC="$(cd "$(dirname "$0")" && pwd)"          # local openclaw/ dir
REMOTE="/root/atlas-openclaw"                   # staging dir on the VPS

# agent id | model | emoji | display name | comma-separated skills
AGENTS=(
  "chief-editor|gemini-direct/gemini-2.5-flash|🎬|Chief Editor|orchestrate-content-run,submit-editorial-review"
  "trend-intelligence|deepseek-direct/deepseek-chat|📈|Trend Intelligence|fetch-signals,calculate-opportunity-score"
  "knowledge-graph|deepseek-direct/deepseek-chat|🕸️|Knowledge Graph Curator|query-semantic-nodes,autolink-entities"
  "research-factcheck|deepseek-direct/deepseek-chat|🔎|Research & Fact-Check|gather-citations,verify-claims"
  "narrative-psychology|gemini-direct/gemini-2.5-flash|🎭|Narrative & Psychology|generate-psych-profile,draft-video-script"
  "commerce-design|deepseek-direct/deepseek-chat|🛍️|Commerce & Design|generate-design-prompt,audit-trademark-compliance"
  "ds-star|gemini-direct/gemini-2.5-flash|📊|DS-Star|forecast-retention,optimize-scoring-weights"
)

echo ">> staging skills + personas to $HOST:$REMOTE"
$SSH "$HOST" "mkdir -p $REMOTE"
scp -i "$KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r \
    "$SRC/skills" "$SRC/agents" "$SRC/agents.manifest.json" "$SRC/deploy-list.txt" "$HOST:$REMOTE/" >/dev/null

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

echo "== 7 hand-authored swarm/executive coordinators =="
for row in "${AGENTS[@]}"; do
  IFS='|' read -r id model emoji name skills <<< "$row"
  deploy_one "$id" "$model" "$emoji" "$name" "$skills"
done

echo "== granular catalog (deploy-list.txt) =="
while IFS='|' read -r id model emoji name host skill; do
  [ -z "$id" ] && continue
  deploy_one "$id" "$model" "$emoji" "$name" "$skill"
done < "$SRC/deploy-list.txt"

echo ">> restart gateway + summary"
$SSH "$HOST" "openclaw gateway restart >/dev/null 2>&1; sleep 5; openclaw agents list 2>&1 | head -30"
echo ">> done"
