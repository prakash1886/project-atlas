"""Generic MCP bridge giving OpenClaw agents direct Temporal-client access --
unlike hermes-bridge (a domain-specific HTTP wrapper around Hermes's API), this
talks the Temporal client protocol directly to the shared cluster, so an agent
can start/signal/query *any* workflow on *any* task queue (ad-automation,
trend-signals, ds-star-science, hermes-content-run), not just Hermes's.

An LLM-driven OpenClaw agent can't embed a Temporal SDK and hold a persistent
connection itself -- this process does that on its behalf, which is what makes
it a "Temporal client" in practice for an agent that can only call MCP tools.
"""
import os

from temporalio.client import Client, WorkflowExecutionStatus
from temporalio.converter import DataConverter
from mcp.server.fastmcp import FastMCP

from temporal_codec import EncryptionCodec

TEMPORAL_ADDRESS = os.environ.get("TEMPORAL_ADDRESS", "localhost:7233")

mcp = FastMCP("temporal-bridge")


async def _client() -> Client:
    return await Client.connect(TEMPORAL_ADDRESS, data_converter=DataConverter(payload_codec=EncryptionCodec()))


@mcp.tool()
async def start_workflow(workflow_type: str, task_queue: str, args: list = None, workflow_id: str = None) -> dict:
    """Starts any workflow by its registered type name (e.g. 'nightlyIntelligenceWorkflow',
    'ContentRunWorkflow') on the given task queue (e.g. 'ds-star-science',
    'hermes-content-run'). Returns immediately -- does not wait for completion."""
    import uuid

    client = await _client()
    handle = await client.start_workflow(
        workflow_type,
        args=args or [],
        id=workflow_id or str(uuid.uuid4()),
        task_queue=task_queue,
    )
    return {"workflow_id": handle.id, "run_id": handle.result_run_id}


@mcp.tool()
async def signal_workflow(workflow_id: str, signal_name: str, arg: dict = None) -> dict:
    """Sends a signal to a running workflow (e.g. a human PASS/REJECT vote for a
    suspended HITL gate)."""
    client = await _client()
    handle = client.get_workflow_handle(workflow_id)
    await handle.signal(signal_name, arg)
    return {"workflow_id": workflow_id, "signaled": signal_name}


@mcp.tool()
async def query_workflow(workflow_id: str, query_name: str, arg: dict = None) -> dict:
    """Queries a running workflow's current state without affecting it."""
    client = await _client()
    handle = client.get_workflow_handle(workflow_id)
    result = await handle.query(query_name, arg)
    return {"workflow_id": workflow_id, "query": query_name, "result": result}


@mcp.tool()
async def get_workflow_result(workflow_id: str) -> dict:
    """Checks a workflow's status via describe() (non-blocking) before ever
    awaiting result(), so an in-progress workflow doesn't hang this call."""
    client = await _client()
    handle = client.get_workflow_handle(workflow_id)
    description = await handle.describe()

    if description.status == WorkflowExecutionStatus.RUNNING:
        return {"workflow_id": workflow_id, "status": "running"}

    if description.status == WorkflowExecutionStatus.COMPLETED:
        result = await handle.result()
        return {"workflow_id": workflow_id, "status": "completed", "result": result}

    return {"workflow_id": workflow_id, "status": "failed", "workflow_status": description.status.name}


if __name__ == "__main__":
    mcp.run()
