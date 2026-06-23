#!/usr/bin/env bash
# Install LiteLLM gateway + LLMLingua-2 compression on the Atlas VPS (spec §11.3).
# Run ON the VPS from the staged infra dir. Requires these env vars:
#   DEEPSEEK_API_KEY, GEMINI_API_KEY   (LITELLM_MASTER_KEY optional; auto-generated)
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
export DEBIAN_FRONTEND=noninteractive

: "${DEEPSEEK_API_KEY:?set DEEPSEEK_API_KEY}"
: "${GEMINI_API_KEY:?set GEMINI_API_KEY}"
MASTER="${LITELLM_MASTER_KEY:-sk-atlas-$(head -c16 /dev/urandom | od -An -tx1 | tr -d ' \n')}"

echo "== apt deps =="
apt-get update -y -qq
apt-get install -y -qq python3-venv python3-pip python3-dev

echo "== /etc/atlas-llm.env =="
umask 077
cat > /etc/atlas-llm.env <<EOF
DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY
GEMINI_API_KEY=$GEMINI_API_KEY
LITELLM_MASTER_KEY=$MASTER
EOF
chmod 600 /etc/atlas-llm.env

echo "== LiteLLM =="
mkdir -p /opt/litellm
[ -d /opt/litellm/venv ] || python3 -m venv /opt/litellm/venv
/opt/litellm/venv/bin/pip install -q --upgrade pip
/opt/litellm/venv/bin/pip install -q "litellm[proxy]"
cp "$SRC/litellm/config.yaml" /opt/litellm/config.yaml
cp "$SRC/litellm/litellm.service" /etc/systemd/system/litellm.service

echo "== LLMLingua-2 =="
mkdir -p /opt/llmlingua/hf
[ -d /opt/llmlingua/venv ] || python3 -m venv /opt/llmlingua/venv
/opt/llmlingua/venv/bin/pip install -q --upgrade pip
# CPU-only torch keeps the install light on a no-GPU VPS
/opt/llmlingua/venv/bin/pip install -q torch --index-url https://download.pytorch.org/whl/cpu
/opt/llmlingua/venv/bin/pip install -q llmlingua fastapi "uvicorn[standard]"
cp "$SRC/llmlingua/server.py" /opt/llmlingua/server.py
cp "$SRC/llmlingua/llmlingua.service" /etc/systemd/system/llmlingua.service

echo "== start services =="
systemctl daemon-reload
systemctl enable --now litellm.service
systemctl enable --now llmlingua.service
sleep 8
systemctl --no-pager --lines=0 status litellm.service llmlingua.service || true
echo "MASTER_KEY=$MASTER"
echo "== done =="
