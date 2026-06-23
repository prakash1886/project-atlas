#!/usr/bin/env bash
# Wire OpenClaw to route through LiteLLM + LLMLingua (spec §11.3). Run ON the VPS.
# Idempotent. Reads the LiteLLM master key from /etc/atlas-llm.env.
set -euo pipefail
MK=$(grep LITELLM_MASTER_KEY /etc/atlas-llm.env | cut -d= -f2)

echo "== repoint providers at LiteLLM + add canonical litellm provider + default =="
openclaw config patch --stdin <<EOF
{
  models: { providers: {
    "deepseek-direct": { baseUrl: "http://127.0.0.1:4000", apiKey: "$MK" },
    "gemini-direct":   { baseUrl: "http://127.0.0.1:4000", apiKey: "$MK" },
    "litellm": {
      baseUrl: "http://127.0.0.1:4000", apiKey: "$MK", api: "openai-completions",
      models: [
        { id:"deepseek-chat",                name:"DeepSeek Chat (LiteLLM)",        api:"openai-completions", input:["text"], contextWindow:128000,  maxTokens:4096, compat:{supportsStore:false} },
        { id:"deepseek-reasoner",            name:"DeepSeek Reasoner (LiteLLM)",    api:"openai-completions", input:["text"], contextWindow:128000,  maxTokens:8192, compat:{supportsStore:false} },
        { id:"gemini-2.5-flash",             name:"Gemini 2.5 Flash (LiteLLM)",     api:"openai-completions", input:["text"], contextWindow:1000000, maxTokens:8192, compat:{supportsStore:false} },
        { id:"gemini-2.5-pro",               name:"Gemini 2.5 Pro (LiteLLM)",       api:"openai-completions", input:["text"], contextWindow:1000000, maxTokens:8192, compat:{supportsStore:false} },
        { id:"deepseek-chat-compressed",     name:"DeepSeek Chat + LLMLingua",      api:"openai-completions", input:["text"], contextWindow:128000,  maxTokens:4096, compat:{supportsStore:false} },
        { id:"gemini-2.5-flash-compressed",  name:"Gemini 2.5 Flash + LLMLingua",   api:"openai-completions", input:["text"], contextWindow:1000000, maxTokens:8192, compat:{supportsStore:false} }
      ]
    }
  } },
  agents: { defaults: { model: { primary: "litellm/deepseek-chat", fallbacks: ["litellm/gemini-2.5-flash"] } } }
}
EOF

echo "== repoint input-heavy agents to compressed variants (spec §11.3) =="
python3 <<'PYEOF'
import json, subprocess
arr = json.loads(subprocess.check_output(["openclaw","config","get","agents.list"]))
DS = {"trend-discovery","demand-forecast","coverage-gap","fact-verification","knowledge-graph","research-factcheck"}
GM = {"hidden-legends","hidden-legends-discovery-scientist","content-opportunity-scientist","audience-scientist",
      "story-universe-scientist","archetype-scientist","geographic-intelligence-scientist","youtube-scientist","backlog-scientist"}
for e in arr:
    if e.get("id") in DS: e["model"]="litellm/deepseek-chat-compressed"
    elif e.get("id") in GM: e["model"]="litellm/gemini-2.5-flash-compressed"
subprocess.run(["openclaw","config","patch","--stdin"],
               input=json.dumps({"agents":{"list":arr}}).encode(), check=True)
print("repointed input-heavy agents")
PYEOF

openclaw gateway restart >/dev/null 2>&1 || true
echo "== done: all agents route via LiteLLM; input-heavy agents use LLMLingua compression =="
