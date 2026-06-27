"""Video Publish execution agent. The video-side counterpart to the existing Upload
agent (spec §10.2, Redbubble/POD only). See soul.txt for the phase breakdown.
"""
import datetime
import os
import httpx
from integrations import youtube_client


def create_metadata(title: str, description: str, tags: list, privacy_status: str) -> dict:
    """creator phase: assemble upload metadata from upstream agents' outputs."""
    return {"title": title, "description": description, "tags": tags, "privacy_status": privacy_status}


async def _download_render(media_url: str) -> str:
    """Render QC validated Remotion's S3 output_url directly; YouTube's resumable
    upload needs local bytes, so this is the one place that pulls the file down."""
    local_path = os.path.join("/tmp", f"publish-{abs(hash(media_url))}.mp4")
    async with httpx.AsyncClient(timeout=300) as client:
        resp = await client.get(media_url)
        resp.raise_for_status()
        with open(local_path, "wb") as f:
            f.write(resp.content)
    return local_path


async def compile_result(media_url: str, metadata: dict) -> dict:
    """compiler phase: download the validated render, then resumable-upload to YouTube."""
    result = {}
    try:
        local_path = await _download_render(media_url)
        response = await youtube_client.upload_video(
            local_path, metadata["title"], metadata["description"], metadata["tags"], metadata["privacy_status"]
        )
        result["video_id"] = response.get("id")
        result["live_url"] = f"https://youtu.be/{result['video_id']}" if result["video_id"] else None
        result["privacy_status"] = metadata["privacy_status"]
        result["status"] = "succeeded" if result["video_id"] else "failed"
    except Exception as exc:
        result["status"] = "failed"
        result["error"] = str(exc)
    return result


def audit_gate(qc_go_no_go: str) -> bool:
    """auditor phase: refuse to publish a Render QC 'no_go' render even if called directly."""
    return qc_go_no_go == "go"


async def run(payload: dict) -> dict:
    if not audit_gate(payload["qc_go_no_go"]):
        return {
            "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
            "status": "blocked_by_qc",
            "error": "Render QC verdict was not 'go'; refusing to publish.",
        }
    metadata = create_metadata(
        payload["title"], payload["description"], payload.get("tags", []), payload.get("privacy_status", "private")
    )
    result = await compile_result(payload["media_url"], metadata)
    return {"generated_at": datetime.datetime.utcnow().isoformat() + "Z", **result}
