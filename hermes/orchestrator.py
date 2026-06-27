"""Content-run orchestrator — the implementation behind chief-editor's
orchestrate-content-run skill (openclaw/agents.manifest.json), which was named in
the catalog but had no code behind it. Sequences the 11 deterministic
video-production agents end to end: Soul Reference -> (Visual/Presenter/Narration/
Music/Asset Sourcing in parallel) -> Captioning -> Video Assembly -> Render QC ->
Video Publish.

Persists the consolidated run result to a local JSON file under DATA_DIR, not
Postgres/Apache AGE as spec §2.3 calls for — Hermes has no DB driver wired in yet
(see config.yaml's production_agents note). This is a known limitation, not a
silent shortcut: migrating persistence once a DB connection exists is necessary
before this orchestrator is spec-compliant, not optional polish.
"""
import asyncio
import datetime
import json
import os
import uuid

import agent_loader

DATA_DIR = os.getenv("DSSTAR_DATA_DIR") or os.path.join(os.path.dirname(__file__), "..", "ds-star", "data")
CONTENT_RUNS_DIR = os.path.join(os.path.dirname(__file__), "data", "content_runs")


async def _run_agent(agent_id: str, payload: dict) -> dict:
    executor = agent_loader.load_executor(agent_id)
    return await executor.run(payload)


async def _resolve_soul_id(personality_id: str, personality_name: str, reference_image_urls: list) -> str:
    if not personality_id or not reference_image_urls:
        return None
    result = await _run_agent("soul-reference", {
        "personality_id": personality_id,
        "personality_name": personality_name,
        "image_urls": reference_image_urls,
    })
    return result.get("soul_id") if result.get("status") == "succeeded" else None


def _first_succeeded(items: list, url_field: str) -> str:
    for item in items or []:
        if item.get("status") == "succeeded" and item.get(url_field):
            return item[url_field]
    return None


async def run_content_pipeline(payload: dict) -> dict:
    run_id = str(uuid.uuid4())
    asset_plan = payload["asset_planner_output"]
    voice = payload["voice_assignment"]
    script_text = payload["script_text"]

    soul_id = await _resolve_soul_id(
        payload.get("personality_id"), payload.get("personality_name"), payload.get("reference_image_urls", [])
    )

    # Visual/Presenter/Narration/Music/Asset Sourcing have no dependency on each
    # other's output, so they fan out in parallel.
    visual_task = _run_agent("visual-generation", {
        "veo_prompts": asset_plan.get("veo_prompts", []),
        "higgsfield_prompts": asset_plan.get("higgsfield_prompts", []),
        "soul_id": soul_id,
    })
    presenter_task = _run_agent("presenter-generation", {
        "avatar_id": asset_plan["heygen_presenter"]["avatar_id"],
        "script_segment": asset_plan["heygen_presenter"]["script_segment"],
        "voice_id": voice.get("voice_id"),
    }) if asset_plan.get("heygen_presenter") else asyncio.sleep(0, result={"status": "skipped"})
    narration_task = _run_agent("narration-synthesis", {
        "voice_id": voice["voice_id"], "energy": voice.get("energy", "medium"), "script_text": script_text,
    })
    music_task = _run_agent("music-generation", {"lyria_prompts": asset_plan.get("lyria_prompts", [])}) \
        if asset_plan.get("lyria_prompts") else asyncio.sleep(0, result={"status": "skipped", "tracks": []})
    asset_sourcing_task = _run_agent("asset-sourcing", {
        "broll": asset_plan.get("broll", []), "music": asset_plan.get("music", []), "images": asset_plan.get("images", []),
    })

    visual_result, presenter_result, narration_result, music_result, asset_sourcing_result = await asyncio.gather(
        visual_task, presenter_task, narration_task, music_task, asset_sourcing_task
    )

    if narration_result.get("status") not in ("succeeded",):
        return _persist(run_id, payload, {
            "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
            "status": "failed", "stage": "narration-synthesis", "narration_result": narration_result,
        })

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
        return _persist(run_id, payload, {
            "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
            "status": "failed", "stage": "video-assembly", "assembly_result": assembly_result,
        })

    qc_result = await _run_agent("render-qc", {
        "media_url": assembly_result["output_url"], "target_format": payload.get("target_format", "long_form"),
    })

    publish_metadata = payload.get("publish_metadata", {})
    publish_result = await _run_agent("video-publish", {
        "qc_go_no_go": qc_result["go_no_go"],
        "media_url": assembly_result["output_url"],
        "title": publish_metadata.get("title", ""),
        "description": publish_metadata.get("description", ""),
        "tags": publish_metadata.get("tags", []),
        "privacy_status": publish_metadata.get("privacy_status", "private"),
    })

    return _persist(run_id, payload, {
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "status": "completed",
        "soul_id": soul_id,
        "visual_result": visual_result,
        "presenter_result": presenter_result,
        "narration_result": narration_result,
        "music_result": music_result,
        "asset_sourcing_result": asset_sourcing_result,
        "captioning_result": captioning_result,
        "assembly_result": assembly_result,
        "qc_result": qc_result,
        "publish_result": publish_result,
    })


def _persist(run_id: str, request_payload: dict, run_result: dict) -> dict:
    os.makedirs(CONTENT_RUNS_DIR, exist_ok=True)
    record = {"run_id": run_id, "request": request_payload, "result": run_result}
    with open(os.path.join(CONTENT_RUNS_DIR, f"{run_id}.json"), "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2)
    return {"run_id": run_id, **run_result}
