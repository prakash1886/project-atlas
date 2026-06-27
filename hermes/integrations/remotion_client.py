"""Remotion-on-AWS-Lambda client. Shells out to the Node helper at
hermes/integrations/remotion/render.mjs rather than reimplementing the Lambda
invoke wire protocol in Python — @remotion/lambda's npm SDK is the stable,
versioned interface; the raw payload it sends to the Lambda function is an
internal implementation detail that changes between Remotion releases.

Requires Node.js + `npm install` run inside hermes/integrations/remotion/ at
deploy time (not a pip dependency — note for the Railway build config).
"""
import os
import json
import asyncio

_HELPER_PATH = os.path.join(os.path.dirname(__file__), "remotion", "render.mjs")
POLL_INTERVAL_SECONDS = 5
POLL_TIMEOUT_SECONDS = 900


async def _run_node(action: str, args: dict) -> dict:
    proc = await asyncio.create_subprocess_exec(
        "node", _HELPER_PATH, action, json.dumps(args),
        stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"remotion render.mjs ({action}) failed: {stderr.decode(errors='ignore')}")
    return json.loads(stdout.decode(errors="ignore"))


async def start_render(composition: str, input_props: dict, codec: str = "h264") -> dict:
    """Returns {renderId, bucketName, ...} per @remotion/lambda's renderMediaOnLambda."""
    return await _run_node("start", {"composition": composition, "inputProps": input_props, "codec": codec})


async def get_progress(render_id: str, bucket_name: str) -> dict:
    return await _run_node("progress", {"renderId": render_id, "bucketName": bucket_name})


async def wait_for_render(render_id: str, bucket_name: str) -> dict:
    elapsed = 0
    while elapsed < POLL_TIMEOUT_SECONDS:
        progress = await get_progress(render_id, bucket_name)
        if progress.get("done") or progress.get("fatalErrorEncountered"):
            return progress
        await asyncio.sleep(POLL_INTERVAL_SECONDS)
        elapsed += POLL_INTERVAL_SECONDS
    raise TimeoutError(f"Remotion render {render_id} did not finish within {POLL_TIMEOUT_SECONDS}s")
