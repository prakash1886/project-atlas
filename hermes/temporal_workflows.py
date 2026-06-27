"""ContentRunWorkflow -- Temporal translation of orchestrator.run_content_pipeline.
Each agent call becomes a durable, retried, timed-out activity execution instead
of a hand-rolled asyncio.gather/_run_agent loop; Temporal's own workflow history
supersedes orchestrator._persist's mid-run checkpoint calls. The pure helper
functions (no I/O, deterministic) are reused as-is from orchestrator.py.
"""
import asyncio
from datetime import timedelta

from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    from temporal_activities import run_production_agent
    from orchestrator import _apply_provider_overrides, _record_provider_outcomes, _first_succeeded

_ACTIVITY_TIMEOUT = timedelta(seconds=600)
_RETRY_POLICY = RetryPolicy(maximum_attempts=3, backoff_coefficient=2.0)


async def _run_agent(agent_id: str, payload: dict) -> dict:
    return await workflow.execute_activity(
        run_production_agent,
        args=[agent_id, payload],
        start_to_close_timeout=_ACTIVITY_TIMEOUT,
        retry_policy=_RETRY_POLICY,
    )


async def _resolve_soul_id(personality_id: str, personality_name: str, reference_image_urls: list) -> str:
    if not personality_id or not reference_image_urls:
        return None
    result = await _run_agent("soul-reference", {
        "personality_id": personality_id,
        "personality_name": personality_name,
        "image_urls": reference_image_urls,
    })
    return result.get("soul_id") if result.get("status") == "succeeded" else None


@workflow.defn
class ContentRunWorkflow:
    @workflow.run
    async def run(self, payload: dict) -> dict:
        asset_plan, provider_overrides = _apply_provider_overrides(payload["asset_planner_output"])
        voice = payload["voice_assignment"]
        script_text = payload["script_text"]

        soul_id = await _resolve_soul_id(
            payload.get("personality_id"), payload.get("personality_name"), payload.get("reference_image_urls", [])
        )

        visual_task = _run_agent("visual-generation", {
            "veo_prompts": asset_plan.get("veo_prompts", []),
            "higgsfield_prompts": asset_plan.get("higgsfield_prompts", []),
            "soul_id": soul_id,
        })
        presenter_task = _run_agent("presenter-generation", {
            "avatar_id": asset_plan["heygen_presenter"]["avatar_id"],
            "script_segment": asset_plan["heygen_presenter"]["script_segment"],
            "voice_id": voice.get("voice_id"),
        }) if asset_plan.get("heygen_presenter") else _skip({"status": "skipped"})
        narration_task = _run_agent("narration-synthesis", {
            "voice_id": voice["voice_id"], "energy": voice.get("energy", "medium"), "script_text": script_text,
        })
        music_task = _run_agent("music-generation", {"lyria_prompts": asset_plan.get("lyria_prompts", [])}) \
            if asset_plan.get("lyria_prompts") else _skip({"status": "skipped", "tracks": []})
        asset_sourcing_task = _run_agent("asset-sourcing", {
            "broll": asset_plan.get("broll", []), "music": asset_plan.get("music", []), "images": asset_plan.get("images", []),
        })
        thumbnail_task = _run_agent("thumbnail-generation", {"concepts": payload.get("thumbnail_concepts", [])}) \
            if payload.get("thumbnail_concepts") else _skip({"status": "skipped", "variants": []})

        (visual_result, presenter_result, narration_result, music_result,
         asset_sourcing_result, thumbnail_result) = await asyncio.gather(
            visual_task, presenter_task, narration_task, music_task, asset_sourcing_task, thumbnail_task
        )
        _record_provider_outcomes(visual_result, music_result)

        if narration_result.get("status") not in ("succeeded",):
            return {
                "generated_at": workflow.now().replace(tzinfo=None).isoformat() + "Z",
                "status": "failed", "stage": "narration-synthesis", "narration_result": narration_result,
            }

        captioning_result = await _run_agent("captioning", {
            "script_text": script_text, "narration_duration_seconds": narration_result["duration_seconds"],
        })

        broll_assets = [a for a in asset_sourcing_result.get("assets", []) if a.get("asset_type") == "broll"]
        music_url = _first_succeeded(music_result.get("tracks", []), "audio_url") \
            or _first_succeeded([a for a in asset_sourcing_result.get("assets", []) if a.get("asset_type") == "music"], "asset_url")

        assembly_result = await _run_agent("video-assembly", {
            "presenter_clip_url": presenter_result.get("clip_url"),
            "generated_clip_urls": [c["clip_url"] for c in visual_result.get("clips", []) if c.get("status") == "succeeded"],
            "broll_urls": [a["asset_url"] for a in broll_assets if a.get("status") == "succeeded"],
            "narration_url": narration_result["audio_url"],
            "music_url": music_url,
            "caption_cues": captioning_result.get("caption_cues", []),
        })

        if assembly_result.get("status") != "succeeded":
            return {
                "generated_at": workflow.now().replace(tzinfo=None).isoformat() + "Z",
                "status": "failed", "stage": "video-assembly", "assembly_result": assembly_result,
            }

        qc_result = await _run_agent("render-qc", {
            "media_url": assembly_result["output_url"], "target_format": payload.get("target_format", "long_form"),
            "clip_count": assembly_result.get("clip_count"),
        })

        thumbnail_url = _first_succeeded(thumbnail_result.get("variants", []), "image_url")
        publish_metadata = payload.get("publish_metadata", {})
        publish_result = await _run_agent("video-publish", {
            "qc_go_no_go": qc_result["go_no_go"],
            "media_url": assembly_result["output_url"],
            "title": publish_metadata.get("title", ""),
            "description": publish_metadata.get("description", ""),
            "tags": publish_metadata.get("tags", []),
            "privacy_status": publish_metadata.get("privacy_status", "private"),
            "thumbnail_url": thumbnail_url,
        })

        return {
            "generated_at": workflow.now().replace(tzinfo=None).isoformat() + "Z",
            "status": "completed",
            "soul_id": soul_id,
            "thumbnail_result": thumbnail_result,
            "provider_overrides": provider_overrides,
            "visual_result": visual_result,
            "presenter_result": presenter_result,
            "narration_result": narration_result,
            "music_result": music_result,
            "asset_sourcing_result": asset_sourcing_result,
            "captioning_result": captioning_result,
            "assembly_result": assembly_result,
            "qc_result": qc_result,
            "publish_result": publish_result,
        }


async def _skip(result: dict) -> dict:
    return result
