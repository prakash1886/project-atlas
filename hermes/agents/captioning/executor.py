"""Captioning execution agent. Consumes Script's exact text + Narration Synthesis's
known duration; produces cue data for Video Assembly's Remotion composition to render
natively. See soul.txt for the phase breakdown.
"""
import datetime
from integrations import captioner

COVERAGE_TOLERANCE_SECONDS = 0.5


def create_cues(script_text: str, narration_duration_seconds: float) -> list:
    """creator phase: time-distribute the known script text, no transcription needed."""
    return captioner.build_cues(script_text, narration_duration_seconds)


def compile_result(cues: list) -> dict:
    """compiler phase: cues are already in Remotion's captionCues shape — nothing to
    convert, this phase exists to mirror the creator/compiler/auditor pattern and is
    where a future format change (e.g. WebVTT for a different renderer) would land."""
    return {"caption_cues": cues, "status": "succeeded" if cues else "failed"}


def audit_result(result: dict, narration_duration_seconds: float) -> dict:
    """auditor phase: confirm the cues collectively span the full narration duration,
    catching a rounding-error gap at the end before Video Assembly renders it."""
    if result["status"] == "succeeded":
        last_cue_end = result["caption_cues"][-1]["end_seconds"]
        if narration_duration_seconds - last_cue_end > COVERAGE_TOLERANCE_SECONDS:
            result["status"] = "coverage_gap"
    return {"generated_at": datetime.datetime.utcnow().isoformat() + "Z", **result}


async def run(payload: dict) -> dict:
    cues = create_cues(payload["script_text"], payload["narration_duration_seconds"])
    result = compile_result(cues)
    return audit_result(result, payload["narration_duration_seconds"])
