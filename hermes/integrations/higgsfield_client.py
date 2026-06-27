"""Higgsfield Cloud API client (REST, not the `higgsfield` CLI — CLI is human/account
management only, spec note from Atlas video-production design discussion).

Auth: Authorization: Key KEY_ID:KEY_SECRET (server credential, distinct from the
device-login OAuth token used by the CLI). Set via env vars, never committed.
"""
import os
import asyncio
import httpx

BASE_URL = os.getenv("HIGGSFIELD_API_BASE", "https://cloud.higgsfield.ai")
KEY_ID = os.getenv("HIGGSFIELD_KEY_ID", "")
KEY_SECRET = os.getenv("HIGGSFIELD_KEY_SECRET", "")
POLL_INTERVAL_SECONDS = 5
POLL_TIMEOUT_SECONDS = 300


def _auth_header() -> dict:
    if not KEY_ID or not KEY_SECRET:
        raise RuntimeError("HIGGSFIELD_KEY_ID / HIGGSFIELD_KEY_SECRET not set")
    return {"Authorization": f"Key {KEY_ID}:{KEY_SECRET}"}


async def create_generation(model: str, prompt: str, soul_id: str = None, image_url: str = None) -> dict:
    """Submit a generate job (image or video model). Returns the job record (includes job id)."""
    payload = {"model": model, "prompt": prompt}
    if soul_id:
        payload["soul_id"] = soul_id
    if image_url:
        payload["image"] = image_url
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(f"{BASE_URL}/v1/generate", json=payload, headers=_auth_header())
        resp.raise_for_status()
        return resp.json()


async def get_job(job_id: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(f"{BASE_URL}/v1/jobs/{job_id}", headers=_auth_header())
        resp.raise_for_status()
        return resp.json()


async def wait_for_job(job_id: str) -> dict:
    """Poll until the job leaves a pending/running state or the timeout elapses."""
    elapsed = 0
    while elapsed < POLL_TIMEOUT_SECONDS:
        job = await get_job(job_id)
        status = job.get("status")
        if status in ("succeeded", "failed", "completed", "error"):
            return job
        await asyncio.sleep(POLL_INTERVAL_SECONDS)
        elapsed += POLL_INTERVAL_SECONDS
    raise TimeoutError(f"Higgsfield job {job_id} did not finish within {POLL_TIMEOUT_SECONDS}s")


async def create_soul_id(name: str, image_urls: list) -> dict:
    payload = {"name": name, "images": image_urls}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(f"{BASE_URL}/v1/soul-ids", json=payload, headers=_auth_header())
        resp.raise_for_status()
        return resp.json()


async def get_soul_id(soul_id: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(f"{BASE_URL}/v1/soul-ids/{soul_id}", headers=_auth_header())
        resp.raise_for_status()
        return resp.json()


async def wait_for_soul_id(soul_id: str) -> dict:
    """Soul training is asynchronous like a generation job — poll until it leaves
    pending/training state or the timeout elapses."""
    elapsed = 0
    while elapsed < POLL_TIMEOUT_SECONDS:
        record = await get_soul_id(soul_id)
        status = record.get("status")
        if status in ("ready", "trained", "succeeded", "failed", "error"):
            return record
        await asyncio.sleep(POLL_INTERVAL_SECONDS)
        elapsed += POLL_INTERVAL_SECONDS
    raise TimeoutError(f"Higgsfield soul-id {soul_id} did not finish training within {POLL_TIMEOUT_SECONDS}s")
