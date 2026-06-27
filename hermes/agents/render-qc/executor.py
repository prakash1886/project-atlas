"""Render QC execution agent. Bridges Video Assembly/Captioning's finished render to
Fact Verification / Retention / Video Publish. See soul.txt for the phase breakdown.
"""
import datetime
import json
import asyncio

_DURATION_RANGE_BY_FORMAT = {
    "shorts": (5, 60),
    "reels": (5, 90),
    "long_form": (90, 3600),
}


async def _probe(media_url: str) -> dict:
    """ffprobe reads the Remotion render's S3 output URL directly over HTTPS — no
    download step needed before QC."""
    proc = await asyncio.create_subprocess_exec(
        "ffprobe", "-v", "error", "-show_entries", "format=duration:stream=width,height,codec_type",
        "-of", "json", media_url,
        stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"ffprobe failed: {stderr.decode(errors='ignore')}")
    return json.loads(stdout.decode(errors="ignore"))


def create_facts(probe_data: dict) -> dict:
    """creator phase: extract duration/resolution/audio-presence from ffprobe's raw output."""
    duration = float(probe_data["format"]["duration"])
    streams = probe_data.get("streams", [])
    video_stream = next((s for s in streams if s.get("codec_type") == "video"), {})
    has_audio = any(s.get("codec_type") == "audio" for s in streams)
    resolution = f"{video_stream.get('width', 0)}x{video_stream.get('height', 0)}"
    return {"duration_seconds": duration, "resolution": resolution, "has_audio_track": has_audio}


def compile_verdict(facts: dict, target_format: str) -> dict:
    """compiler phase: compare facts against the target format's expected duration range."""
    reasons = []
    min_dur, max_dur = _DURATION_RANGE_BY_FORMAT.get(target_format, (0, 3600))
    if not (min_dur <= facts["duration_seconds"] <= max_dur):
        reasons.append(f"duration {facts['duration_seconds']:.1f}s outside {target_format} range [{min_dur}, {max_dur}]s")
    if not facts["has_audio_track"]:
        reasons.append("no audio track detected")
    return {**facts, "format": target_format, "reasons": reasons}


def audit_verdict(verdict: dict) -> dict:
    """auditor phase: final go/no-go, so a broken render never reaches Video Publish silently."""
    go_no_go = "go" if not verdict["reasons"] else "no_go"
    return {"generated_at": datetime.datetime.utcnow().isoformat() + "Z", "go_no_go": go_no_go, **verdict}


async def run(payload: dict) -> dict:
    probe_data = await _probe(payload["media_url"])
    facts = create_facts(probe_data)
    verdict = compile_verdict(facts, payload["target_format"])
    return audit_verdict(verdict)
