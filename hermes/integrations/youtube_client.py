"""YouTube Data API v3 client — resumable upload of the final rendered video plus
metadata (title/description/tags), and the only thing in the spec that actually
publishes a video (the existing `upload` agent only handles Redbubble/POD merch
listings, spec §10.2 — this is its video-side counterpart).

Auth: OAuth2 access token, refreshed externally (YOUTUBE_ACCESS_TOKEN env var).
Token refresh/rotation is out of scope for this client.
"""
import os
import httpx

UPLOAD_BASE_URL = "https://www.googleapis.com/upload/youtube/v3/videos"
ACCESS_TOKEN = os.getenv("YOUTUBE_ACCESS_TOKEN", "")


def _auth_header() -> dict:
    if not ACCESS_TOKEN:
        raise RuntimeError("YOUTUBE_ACCESS_TOKEN not set")
    return {"Authorization": f"Bearer {ACCESS_TOKEN}"}


async def upload_video(file_path: str, title: str, description: str, tags: list, privacy_status: str = "private") -> dict:
    metadata = {
        "snippet": {"title": title, "description": description, "tags": tags},
        "status": {"privacyStatus": privacy_status},
    }
    with open(file_path, "rb") as f:
        video_bytes = f.read()

    async with httpx.AsyncClient(timeout=600) as client:
        init_resp = await client.post(
            UPLOAD_BASE_URL,
            params={"uploadType": "resumable", "part": "snippet,status"},
            headers={**_auth_header(), "X-Upload-Content-Type": "video/mp4"},
            json=metadata,
        )
        init_resp.raise_for_status()
        upload_url = init_resp.headers["Location"]

        upload_resp = await client.put(
            upload_url, headers={"Content-Type": "video/mp4"}, content=video_bytes
        )
        upload_resp.raise_for_status()
        return upload_resp.json()
