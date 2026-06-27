"""Google Veo client via Vertex AI's predictLongRunning endpoint.

Auth: Google service-account access token (GOOGLE_VEO_ACCESS_TOKEN env var, refreshed
externally — Vertex AI tokens expire hourly, refreshing them is out of scope for this
client). GOOGLE_VEO_PROJECT_ID / GOOGLE_VEO_LOCATION select the Vertex project/region.
"""
import os
import asyncio
import httpx

LOCATION = os.getenv("GOOGLE_VEO_LOCATION", "us-central1")
PROJECT_ID = os.getenv("GOOGLE_VEO_PROJECT_ID", "")
MODEL_ID = os.getenv("GOOGLE_VEO_MODEL_ID", "veo-3.0-generate-001")
ACCESS_TOKEN = os.getenv("GOOGLE_VEO_ACCESS_TOKEN", "")
POLL_INTERVAL_SECONDS = 10
POLL_TIMEOUT_SECONDS = 600


def _base_url() -> str:
    if not PROJECT_ID:
        raise RuntimeError("GOOGLE_VEO_PROJECT_ID not set")
    return (
        f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}"
        f"/locations/{LOCATION}/publishers/google/models/{MODEL_ID}"
    )


def _auth_header() -> dict:
    if not ACCESS_TOKEN:
        raise RuntimeError("GOOGLE_VEO_ACCESS_TOKEN not set")
    return {"Authorization": f"Bearer {ACCESS_TOKEN}"}


async def create_generation(prompt: str, aspect_ratio: str = "9:16") -> dict:
    """Submit a Veo long-running video generation operation. Returns the operation record."""
    payload = {"instances": [{"prompt": prompt}], "parameters": {"aspectRatio": aspect_ratio}}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(f"{_base_url()}:predictLongRunning", json=payload, headers=_auth_header())
        resp.raise_for_status()
        return resp.json()


async def get_operation(operation_name: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{_base_url()}:fetchPredictOperation",
            json={"operationName": operation_name},
            headers=_auth_header(),
        )
        resp.raise_for_status()
        return resp.json()


async def wait_for_operation(operation_name: str) -> dict:
    elapsed = 0
    while elapsed < POLL_TIMEOUT_SECONDS:
        op = await get_operation(operation_name)
        if op.get("done"):
            return op
        await asyncio.sleep(POLL_INTERVAL_SECONDS)
        elapsed += POLL_INTERVAL_SECONDS
    raise TimeoutError(f"Veo operation {operation_name} did not finish within {POLL_TIMEOUT_SECONDS}s")
