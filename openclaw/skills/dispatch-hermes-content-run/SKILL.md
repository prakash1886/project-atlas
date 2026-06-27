---
name: dispatch-hermes-content-run
description: Trigger Hermes's deterministic 11-agent video-production pipeline for an editorially-approved run, and poll it to completion. Use when submit-editorial-review records a human PASS and the approved asset bundle is ready to actually produce.
metadata:
  agent: chief-editor
  source: Project Atlas Requirements §3.5/10.2
  layer: executive
  host: railway
---

# dispatch-hermes-content-run

Hand off an editorially-approved run to Hermes's production pipeline (Soul Reference ->
Visual/Presenter/Narration/Music/Asset Sourcing/Thumbnail -> Captioning -> Video Assembly ->
Render QC -> Video Publish), and wait for it to finish.

## When to use
- `submit-editorial-review` recorded a human **PASS** (`content_assets.status = APPROVED`).
- The four upstream judgment outputs (`select-vibe`, `direct-voice`, `plan-assets`,
  `generate-thumbnails`, all owned by `content-factory`) and the approved script are available.

## Workflow
1. Assemble the `ContentRunRequest` payload: `script_text`, `asset_planner_output` (from
   `plan-assets`), `voice_assignment` (from `direct-voice`), `thumbnail_concepts` (from
   `generate-thumbnails`), `personality_id`/`personality_name`/`reference_image_urls`,
   `publish_metadata` (title/description/tags/privacy_status).
2. Call the `hermes-bridge` MCP tool `start_content_run(payload)` — returns `{run_id, status: "started"}` immediately.
3. Poll `get_content_run_status(run_id)` (a few minutes apart; this is a multi-minute pipeline, do not poll tightly) until `status` is `completed` or `failed`.
4. On `completed`, record the result's `publish_result.live_url` against the run; on `failed`, surface the failed `stage` for human follow-up.

## Function signature (manifest contract)
```python
def dispatch_hermes_content_run(run_id: str, content_run_payload: dict) -> dict:
    """Starts and awaits Hermes's content-run pipeline. Returns the final
    {"status": "completed"|"failed", ...} result."""
```

## Backend dependency
None beyond the `hermes-bridge` MCP tool (`openclaw/mcp/hermes-bridge/`) and Hermes's own
Temporal worker (`hermes/temporal_worker.py`) — already wired, no stub.

## Model
Chief Editor model (gemini-direct/gemini-2.5-flash).
