"""Temporal activity wrapping the existing production-agent executors.
One generic activity covers all 11 agents -- agent_loader.load_executor already
dispatches by agent_id, so there's no need for 11 separate activity functions.
Executors themselves (hermes/agents/*/executor.py) are unchanged.
"""
from temporalio import activity

import agent_loader


@activity.defn
async def run_production_agent(agent_id: str, payload: dict) -> dict:
    """A normal {"status": "failed", ...} result is returned as-is -- that's
    the agent reporting a real business-logic failure, which Temporal must not
    retry. A raised exception (network blip, etc) propagates so the workflow's
    RetryPolicy on this activity handles the retry instead of us hand-rolling it."""
    executor = agent_loader.load_executor(agent_id)
    return await executor.run(payload)
