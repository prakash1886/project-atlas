"""TubeLab REST client for the content-opportunity scientist's niche/outlier/trend
research step. Optional, like modal/app.py's call_modal_script_agent: returns an
empty list rather than raising when TUBELAB_API_KEY isn't configured, so
content-opportunity keeps working (just without this data source) on deployments
that haven't set the key yet.
"""
import logging
import os
from typing import List, Dict, Any

import httpx

logger = logging.getLogger("Hermes-Science-API")

BASE_URL = "https://public-api.tubelab.net/v1"
_TIMEOUT = 30


def _api_key() -> str:
    return os.getenv("TUBELAB_API_KEY", "")


async def _get(path: str, params: Dict[str, Any]) -> List[Dict[str, Any]]:
    api_key = _api_key()
    if not api_key:
        return []

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            resp = await client.get(
                f"{BASE_URL}{path}",
                headers={"Authorization": f"Api-Key {api_key}"},
                params=params,
            )
            resp.raise_for_status()
            data = resp.json()
            # TubeLab wraps list results under "data" per its docs; fall back to the
            # raw payload if it's already a list (defensive against API variance).
            return data.get("data", data) if isinstance(data, dict) else data
    except Exception as e:
        logger.warning(f"[TubeLab] {path} call failed, continuing without this data: {e}")
        return []


async def search_outliers(niche: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Outliers GET — breakout/high-performing videos for a niche. Feeds
    content-opportunity's virality_score / discussion_intensity_score reasoning."""
    return await _get("/outliers", {"query": niche, "limit": limit})


async def search_channels(query: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Channels GET — niche/channel discovery. Feeds evergreen_score / niche-saturation
    reasoning (monetization_score still comes from the LLM's own judgment, TubeLab's
    RPM-style data isn't part of this endpoint)."""
    return await _get("/channels", {"query": query, "limit": limit})
