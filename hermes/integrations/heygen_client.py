"""HeyGen API client — generates the talking-head presenter clip from an avatar_id
and a script segment (asset-planner's heygen_presenter field, spec §3.5).
"""
import os
import asyncio
import httpx

BASE_URL = os.getenv("HEYGEN_API_BASE", "https://api.heygen.com")
API_KEY = os.getenv("HEYGEN_API_KEY", "")
POLL_INTERVAL_SECONDS = 10
POLL_TIMEOUT_SECONDS = 600


def _auth_header() -> dict:
    if not API_KEY:
        raise RuntimeError("HEYGEN_API_KEY not set")
    return {"X-Api-Key": API_KEY}


async def create_video(avatar_id: str, script_segment: str, voice_id: str = None) -> dict:
    payload = {
        "video_inputs": [{
            "character": {"type": "avatar", "avatar_id": avatar_id},
            "voice": {"type": "text", "input_text": script_segment, **({"voice_id": voice_id} if voice_id else {})},
        }]
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(f"{BASE_URL}/v2/video/generate", json=payload, headers=_auth_header())
        resp.raise_for_status()
        return resp.json()


async def get_video_status(video_id: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{BASE_URL}/v1/video_status.get", params={"video_id": video_id}, headers=_auth_header()
        )
        resp.raise_for_status()
        return resp.json()


async def wait_for_video(video_id: str) -> dict:
    elapsed = 0
    while elapsed < POLL_TIMEOUT_SECONDS:
        status = await get_video_status(video_id)
        state = status.get("data", {}).get("status")
        if state in ("completed", "failed"):
            return status
        await asyncio.sleep(POLL_INTERVAL_SECONDS)
        elapsed += POLL_INTERVAL_SECONDS
    raise TimeoutError(f"HeyGen video {video_id} did not finish within {POLL_TIMEOUT_SECONDS}s")
