"""LLMLingua-2 prompt-compression microservice for Project Atlas (spec §11.3).

A tiny CPU-only HTTP service that compresses the input side of a prompt before it is
sent to the LLM. Intended as a pre-send step for input-heavy agents (trend/research/
scientists) per spec §11.3 ("runs cheaply on the Hostinger VPS CPU as a pre-processing
step"). Loopback-only.

POST /compress  {"prompt": str, "rate": 0.5, "force_tokens": ["\n", ".", "?"]}
  -> {"compressed_prompt": str, "origin_tokens": int, "compressed_tokens": int, "ratio": str}
GET  /health    -> {"status": "ok", "model": "..."}
"""
import os
from fastapi import FastAPI
from pydantic import BaseModel
from llmlingua import PromptCompressor

# LLMLingua-2 — bert-base multilingual is light enough for a 2-vCPU CPU box.
MODEL = os.environ.get("LLMLINGUA_MODEL",
                       "microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank")

app = FastAPI(title="atlas-llmlingua")
compressor = PromptCompressor(model_name=MODEL, use_llmlingua2=True, device_map="cpu")


class Req(BaseModel):
    prompt: str
    rate: float = 0.5            # keep ~50% of tokens; lower = more compression
    target_token: int = -1       # alternative to rate; -1 disables
    force_tokens: list[str] = ["\n", ".", "?", "!"]


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL}


@app.post("/compress")
def compress(r: Req):
    kwargs = {"rate": r.rate} if r.target_token < 0 else {"target_token": r.target_token}
    out = compressor.compress_prompt(r.prompt, force_tokens=r.force_tokens, **kwargs)
    return {
        "compressed_prompt": out["compressed_prompt"],
        "origin_tokens": out["origin_tokens"],
        "compressed_tokens": out["compressed_tokens"],
        "ratio": out["ratio"],
    }
