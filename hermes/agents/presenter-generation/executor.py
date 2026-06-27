"""Presenter Generation execution agent. Consumes Asset Planner's heygen_presenter
object (spec §3.5). See soul.txt for the creator/compiler/auditor phase breakdown.
"""
import datetime
from integrations import heygen_client


def create_job(avatar_id: str, script_segment: str, voice_id: str = None) -> dict:
    return {"avatar_id": avatar_id, "script_segment": script_segment, "voice_id": voice_id}


async def compile_result(job: dict) -> dict:
    result = {"avatar_id": job["avatar_id"]}
    try:
        submitted = await heygen_client.create_video(job["avatar_id"], job["script_segment"], job.get("voice_id"))
        video_id = submitted.get("data", {}).get("video_id")
        status = await heygen_client.wait_for_video(video_id)
        data = status.get("data", {})
        result["clip_url"] = data.get("video_url")
        result["status"] = "succeeded" if data.get("status") == "completed" else "failed"
    except TimeoutError:
        result["status"] = "timed_out"
    except Exception as exc:
        result["status"] = "failed"
        result["error"] = str(exc)
    return result


def audit_result(result: dict) -> dict:
    return {"generated_at": datetime.datetime.utcnow().isoformat() + "Z", **result}


async def run(payload: dict) -> dict:
    job = create_job(payload["avatar_id"], payload["script_segment"], payload.get("voice_id"))
    result = await compile_result(job)
    return audit_result(result)
