"""Music Generation execution agent. Consumes Asset Planner's lyria_prompts[] (spec
§3.5) — the AI-generated counterpart to Asset Sourcing's Envato-licensed music[].
See soul.txt for the creator/compiler/auditor phase breakdown.
"""
import datetime
import os
from integrations import lyria_client, ffmpeg_tools, storage_client


def create_jobs(lyria_prompts: list, negative_prompt: str = None) -> list:
    """creator phase: one Lyria request per prompt."""
    return [{"prompt": prompt, "negative_prompt": negative_prompt} for prompt in lyria_prompts or []]


async def compile_results(jobs: list) -> list:
    """compiler phase: call Lyria, write audio, probe duration."""
    tracks = []
    for index, job in enumerate(jobs):
        track = {"prompt": job["prompt"]}
        try:
            samples = await lyria_client.generate(job["prompt"], job.get("negative_prompt"))
            if not samples:
                track["status"] = "no_samples_returned"
                tracks.append(track)
                continue
            audio_path = os.path.join("/tmp", f"lyria-track-{index}.wav")
            with open(audio_path, "wb") as f:
                f.write(samples[0])
            track["audio_path"] = audio_path
            track["duration_seconds"] = await ffmpeg_tools.probe_duration_seconds(audio_path)
            # Video Assembly's Remotion render runs on AWS Lambda, which can't read
            # this local path — upload so it has a URL to fetch instead.
            track["audio_url"] = storage_client.upload_and_get_url(audio_path, "music")
            track["status"] = "succeeded"
        except Exception as exc:
            track["status"] = "failed"
            track["error"] = str(exc)
        tracks.append(track)
    return tracks


def audit_results(tracks: list) -> dict:
    """auditor phase: flag any prompt that didn't produce usable audio rather than
    letting Video Assembly silently receive fewer tracks than Asset Planner intended."""
    failed = [t for t in tracks if t["status"] != "succeeded"]
    return {
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "tracks": tracks,
        "failed_track_count": len(failed),
    }


async def run(payload: dict) -> dict:
    jobs = create_jobs(payload.get("lyria_prompts", []), payload.get("negative_prompt"))
    tracks = await compile_results(jobs)
    return audit_results(tracks)
