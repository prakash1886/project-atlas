"""Video Assembly execution agent — composites everything upstream produces via a
Remotion composition rendered on AWS Lambda. See soul.txt for the
creator/compiler/auditor phase breakdown.

All clip/audio inputs must be URLs Lambda can fetch over HTTPS, not local Railway
paths — Visual/Presenter Generation's clip_urls come straight from their providers'
hosted storage; Narration/Music/Asset Sourcing's *_url fields are the result of
their storage_client.upload_and_get_url() step.
"""
import datetime
from integrations import remotion_client

COMPOSITION_ID = "AtlasStoryVideo"


def create_input_props(presenter_clip_url: str, generated_clip_urls: list, broll_urls: list,
                        narration_url: str, music_url: str, caption_cues: list) -> dict:
    """creator phase: order presenter -> generated/b-roll shots and assemble Remotion's
    inputProps for the pre-deployed AtlasStoryVideo composition."""
    ordered_clips = []
    if presenter_clip_url:
        ordered_clips.append(presenter_clip_url)
    ordered_clips.extend(generated_clip_urls or [])
    ordered_clips.extend(broll_urls or [])
    return {
        "clips": ordered_clips,
        "narrationUrl": narration_url,
        "musicUrl": music_url,
        "captionCues": caption_cues or [],
    }


async def compile_result(input_props: dict) -> dict:
    """compiler phase: trigger renderMediaOnLambda and poll until Lambda finishes."""
    result = {"clip_count": len(input_props["clips"])}
    try:
        started = await remotion_client.start_render(COMPOSITION_ID, input_props)
        result["render_id"] = started["renderId"]
        result["bucket_name"] = started["bucketName"]
        progress = await remotion_client.wait_for_render(started["renderId"], started["bucketName"])
        if progress.get("fatalErrorEncountered"):
            result["status"] = "failed"
            result["error"] = "; ".join(progress.get("errors", [])) or "Remotion reported a fatal error"
        else:
            result["output_url"] = progress.get("outputFile")
            result["status"] = "succeeded" if result["output_url"] else "failed"
    except TimeoutError:
        result["status"] = "timed_out"
    except Exception as exc:
        result["status"] = "failed"
        result["error"] = str(exc)
    return result


def audit_result(result: dict) -> dict:
    """auditor phase: confirms the render completed without a fatal error. Does not
    itself validate the rendered file's technical properties — that is Render QC's
    job once the file exists at output_url."""
    return {"generated_at": datetime.datetime.utcnow().isoformat() + "Z", **result}


async def run(payload: dict) -> dict:
    input_props = create_input_props(
        payload.get("presenter_clip_url"),
        payload.get("generated_clip_urls", []),
        payload.get("broll_urls", []),
        payload["narration_url"],
        payload.get("music_url"),
        payload.get("caption_cues", []),
    )
    result = await compile_result(input_props)
    return audit_result(result)
