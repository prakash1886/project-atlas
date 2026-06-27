"""MCP bridge between OpenClaw agents and Hermes's HTTP API (Railway). OpenClaw
SKILL.md files are pure prompt text -- this is the only thing in the repo that
gives an OpenClaw agent an actual callable function to reach Hermes, rather than
the "BACKEND DEPENDENCY -- stubbed" placeholder every relevant SKILL.md carries
today. Registered via `openclaw mcp add` in deploy.sh, not Claude Code's own
.mcp.json (which is unrelated -- that's this repo's own MCP config, not the
OpenClaw VPS gateway's).

Three tools, deliberately generic rather than one-per-skill:
- run_judgment_agent: any of Hermes's LLM self-improving judgment agents
  (vibe, voice-director, asset-planner, thumbnail, ...) via POST /v1/agents/{id}.
- start_content_run / get_content_run_status: the deterministic 11-agent video
  pipeline, via the non-blocking start+poll pair in hermes/app.py (a real run
  exceeds any reasonable synchronous HTTP timeout).
"""
import os

import httpx
from mcp.server.fastmcp import FastMCP

HERMES_BASE_URL = os.environ["HERMES_BASE_URL"].rstrip("/")
DSSTAR_API_KEY = os.environ["DSSTAR_API_KEY"]

mcp = FastMCP("hermes-bridge")


def _headers() -> dict:
    return {"Authorization": f"Bearer {DSSTAR_API_KEY}"}


@mcp.tool()
async def run_judgment_agent(insight_type: str, query: str, context: dict = None) -> dict:
    """Runs one of Hermes's LLM judgment agents (vibe, voice-director,
    asset-planner, thumbnail, etc) and returns its structured JSON output."""
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            f"{HERMES_BASE_URL}/v1/agents/{insight_type}",
            headers=_headers(),
            json={"query": query, "context": context or {}},
        )
        resp.raise_for_status()
        return resp.json()


@mcp.tool()
async def start_content_run(payload: dict) -> dict:
    """Starts the deterministic 11-agent video-production pipeline (Hermes's
    ContentRunWorkflow) and returns immediately with a run_id -- does not wait
    for the run to finish. Poll get_content_run_status with that run_id."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{HERMES_BASE_URL}/v1/orchestrate/content-run/start",
            headers=_headers(),
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()


@mcp.tool()
async def get_content_run_status(run_id: str) -> dict:
    """Polls a content run started by start_content_run. Returns status
    'running', 'completed' (with the full result), or 'failed'."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{HERMES_BASE_URL}/v1/orchestrate/content-run/status/{run_id}",
            headers=_headers(),
        )
        resp.raise_for_status()
        return resp.json()


if __name__ == "__main__":
    mcp.run()
