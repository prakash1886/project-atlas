"""Envato Elements client — fetches/downloads the licensed b-roll, music, image and
template assets that asset-planner's broll[]/music[]/images[] entries reference
(spec §3.5/§10.2 extension). Asset Planner only queries/selects; this client is the
execution step that actually pulls the bytes.
"""
import os
import httpx

BASE_URL = os.getenv("ENVATO_API_BASE", "https://elements.envato.com/api/v3")
API_TOKEN = os.getenv("ENVATO_API_TOKEN", "")


def _auth_header() -> dict:
    if not API_TOKEN:
        raise RuntimeError("ENVATO_API_TOKEN not set")
    return {"Authorization": f"Bearer {API_TOKEN}"}


async def search_items(query: str, item_type: str) -> dict:
    """item_type: stock-video | stock-photo | music | graphic-template."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{BASE_URL}/search", params={"term": query, "filters[contentTypeId]": item_type}, headers=_auth_header()
        )
        resp.raise_for_status()
        return resp.json()


async def download_item(item_id: str) -> bytes:
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.get(f"{BASE_URL}/download", params={"item_id": item_id}, headers=_auth_header())
        resp.raise_for_status()
        return resp.content
