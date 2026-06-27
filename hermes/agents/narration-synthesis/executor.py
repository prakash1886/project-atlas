"""Narration Synthesis execution agent. Consumes Voice Director's voice assignment +
Script's final text (spec §3.5). See soul.txt for the creator/compiler/auditor phase
breakdown.
"""
import datetime
import os
from integrations import elevenlabs_client, ffmpeg_tools, storage_client

WORDS_PER_SECOND_NOMINAL = 2.5


def create_job(voice_id: str, energy: str, script_text: str, output_path: str) -> dict:
    return {"voice_id": voice_id, "energy": energy, "script_text": script_text, "output_path": output_path}


async def compile_result(job: dict) -> dict:
    result = {"voice_id": job["voice_id"]}
    try:
        audio_bytes = await elevenlabs_client.synthesize(job["voice_id"], job["script_text"], job["energy"])
        with open(job["output_path"], "wb") as f:
            f.write(audio_bytes)
        result["audio_path"] = job["output_path"]
        result["duration_seconds"] = await ffmpeg_tools.probe_duration_seconds(job["output_path"])
        # Video Assembly's Remotion render runs on AWS Lambda, which can't read this
        # local path — upload so it has a URL to fetch instead.
        result["audio_url"] = storage_client.upload_and_get_url(job["output_path"], "narration")
        result["status"] = "succeeded"
    except Exception as exc:
        result["status"] = "failed"
        result["error"] = str(exc)
    return result


def audit_result(result: dict, script_text: str) -> dict:
    """Flags a synthesized track whose duration is wildly off from word-count expectations
    (e.g. truncated audio, wrong text sent) rather than passing it silently downstream."""
    if result.get("status") == "succeeded":
        expected = len(script_text.split()) / WORDS_PER_SECOND_NOMINAL
        actual = result["duration_seconds"]
        if actual < expected * 0.5 or actual > expected * 2.0:
            result["status"] = "implausible_duration"
    return {"generated_at": datetime.datetime.utcnow().isoformat() + "Z", **result}


async def run(payload: dict) -> dict:
    output_path = payload.get("output_path") or os.path.join("/tmp", f"narration-{payload['voice_id']}.mp3")
    job = create_job(payload["voice_id"], payload.get("energy", "medium"), payload["script_text"], output_path)
    result = await compile_result(job)
    return audit_result(result, payload["script_text"])
