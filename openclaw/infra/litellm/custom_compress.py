"""LiteLLM pre-call hook: LLMLingua-2 prompt compression (spec §11.3).

Opt-in and selective: only fires for model names ending in `-compressed`, and only
compresses the LAST user message (the dynamic per-item content) — never the system
prefix (so prompt caching on the static prefix is preserved, per spec §11.3 sequencing).
Handles both string content and OpenAI structured content (list of {type:text,text}).
Fails open: if the LLMLingua service is unavailable, the original prompt is sent.
"""
import os
import httpx
from litellm.integrations.custom_logger import CustomLogger

LLMLINGUA_URL = os.environ.get("LLMLINGUA_URL", "http://127.0.0.1:8200/compress")
RATE = float(os.environ.get("LLMLINGUA_RATE", "0.5"))
MIN_CHARS = int(os.environ.get("LLMLINGUA_MIN_CHARS", "400"))  # skip short prompts


async def _compress(text: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=60) as c:
            r = await c.post(LLMLINGUA_URL, json={"prompt": text, "rate": RATE})
            if r.status_code == 200:
                out = r.json()
                print(f"[llmlingua] {out['origin_tokens']}->{out['compressed_tokens']} tok ({out['ratio']})", flush=True)
                return out["compressed_prompt"]
    except Exception as e:  # fail open
        print(f"[llmlingua] skipped ({e})", flush=True)
    return text


class CompressHook(CustomLogger):
    async def async_pre_call_hook(self, user_api_key_dict, cache, data, call_type):
        if not (data.get("model", "") or "").endswith("-compressed"):
            return data
        msgs = data.get("messages") or []
        for i in range(len(msgs) - 1, -1, -1):
            m = msgs[i]
            if m.get("role") != "user":
                continue
            c = m.get("content")
            if isinstance(c, str) and len(c) >= MIN_CHARS:
                m["content"] = await _compress(c)
                break
            if isinstance(c, list):
                hit = False
                for part in c:
                    if (isinstance(part, dict) and part.get("type") == "text"
                            and isinstance(part.get("text"), str) and len(part["text"]) >= MIN_CHARS):
                        part["text"] = await _compress(part["text"])
                        hit = True
                if hit:
                    break
        data["messages"] = msgs
        return data


proxy_handler_instance = CompressHook()
