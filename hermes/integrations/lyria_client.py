"""Google Lyria client via Vertex AI's synchronous :predict endpoint (Lyria is not a
long-running operation like Veo — it returns base64-encoded audio directly).

Auth: same Vertex AI access-token model as veo_client.py (GOOGLE_LYRIA_ACCESS_TOKEN,
refreshed externally — token refresh is out of scope for this client).
"""
import os
import base64
import httpx

LOCATION = os.getenv("GOOGLE_LYRIA_LOCATION", "us-central1")
PROJECT_ID = os.getenv("GOOGLE_LYRIA_PROJECT_ID", "")
MODEL_ID = os.getenv("GOOGLE_LYRIA_MODEL_ID", "lyria-002")
ACCESS_TOKEN = os.getenv("GOOGLE_LYRIA_ACCESS_TOKEN", "")


def _base_url() -> str:
    if not PROJECT_ID:
        raise RuntimeError("GOOGLE_LYRIA_PROJECT_ID not set")
    return (
        f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}"
        f"/locations/{LOCATION}/publishers/google/models/{MODEL_ID}"
    )


def _auth_header() -> dict:
    if not ACCESS_TOKEN:
        raise RuntimeError("GOOGLE_LYRIA_ACCESS_TOKEN not set")
    return {"Authorization": f"Bearer {ACCESS_TOKEN}"}


async def generate(prompt: str, negative_prompt: str = None, sample_count: int = 1) -> list:
    """Synchronous call — returns a list of raw WAV bytes, one per requested sample."""
    instance = {"prompt": prompt}
    if negative_prompt:
        instance["negative_prompt"] = negative_prompt
    payload = {"instances": [instance], "parameters": {"sampleCount": sample_count}}
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(f"{_base_url()}:predict", json=payload, headers=_auth_header())
        resp.raise_for_status()
        predictions = resp.json().get("predictions", [])
        return [base64.b64decode(p["bytesBase64Encoded"]) for p in predictions if p.get("bytesBase64Encoded")]
