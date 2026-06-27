"""ElevenLabs TTS client — synthesizes narration audio from the Voice Director agent's
voice_id/pace/energy/emotion assignment (spec §3.5) and the final script text.
"""
import os
import httpx

BASE_URL = os.getenv("ELEVENLABS_API_BASE", "https://api.elevenlabs.io")
API_KEY = os.getenv("ELEVENLABS_API_KEY", "")

_STABILITY_BY_ENERGY = {"low": 0.75, "medium": 0.5, "high": 0.3}


def _auth_header() -> dict:
    if not API_KEY:
        raise RuntimeError("ELEVENLABS_API_KEY not set")
    return {"xi-api-key": API_KEY}


async def synthesize(voice_id: str, text: str, energy: str = "medium") -> bytes:
    """Returns raw audio bytes (mp3) for the given voice/text."""
    payload = {
        "text": text,
        "voice_settings": {
            "stability": _STABILITY_BY_ENERGY.get(energy, 0.5),
            "similarity_boost": 0.75,
        },
    }
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{BASE_URL}/v1/text-to-speech/{voice_id}", json=payload, headers=_auth_header()
        )
        resp.raise_for_status()
        return resp.content
