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
THUMBNAIL_BASE_URL = "https://www.googleapis.com/upload/youtube/v3/thumbnails/set"
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


async def set_thumbnail(video_id: str, image_url: str) -> dict:
    """Downloads the thumbnail-generation agent's image_url and sets it as the
    video's thumbnail via YouTube's thumbnails.set endpoint."""
    async with httpx.AsyncClient(timeout=60) as client:
        image_resp = await client.get(image_url)
        image_resp.raise_for_status()
        image_bytes = image_resp.content

        set_resp = await client.post(
            THUMBNAIL_BASE_URL,
            params={"videoId": video_id},
            headers={**_auth_header(), "Content-Type": "image/png"},
            content=image_bytes,
        )
        set_resp.raise_for_status()
        return set_resp.json()
