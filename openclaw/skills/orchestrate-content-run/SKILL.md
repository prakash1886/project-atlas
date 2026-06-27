---
name: orchestrate-content-run
description: Spawn and monitor a full content production run (research → fact-check → psychology → story) for one topic opportunity, managing the iterative quality-score loop until it clears threshold. Use when the Chief Editor agent must turn an approved topic opportunity into a complete asset bundle, or when asked to "produce", "run", or "orchestrate" content for a topic.
metadata:
  agent: chief-editor
  source: Project Atlas Agent Skills Manifest §1
  layer: executive
---

# orchestrate-content-run

Direct the research → writing → design → analytics loop for a single topic, ensuring quality
scores exceed threshold before human review.

## When to use
- A topic opportunity has been approved (from Trend Intelligence / DS-Star backlog) and needs production.
- You must coordinate the Research, Fact-Check, Psychology, and Story agents on one run.

## Workflow
1. Call the `temporal-bridge` MCP tool `start_workflow("qualityLoopWorkflow", "quality-loop", [{"topic": topic, "subjectEntity": subject_entity, "durationMinutes": duration_minutes}])`.
2. Call `get_workflow_result(workflow_id)` -- blocks until the workflow finishes its (max 3) durable revision loop: gather-citations + generate-psych-profile -> draft-video-script -> verify-claims, scored deterministically (`100 - 30*high - 10*medium - 5*low` per flagged contradiction, not by asking a model to grade itself), feeding contradictions back into the next draft as revision notes.
3. Result is `{contentAssetId, finalScore, passed}`. On `passed: true`, hand off to `submit-editorial-review` with `contentAssetId`. On `passed: false` (3 iterations exhausted), the `content_assets` row is left `NEEDS_REVISION` for a human to look at directly rather than looping forever.

## Function signature (manifest contract)
```python
def orchestrate_content_run(topic_opportunity: dict) -> dict:
    """
    Returns:
    {
      "run_id": "RUN-0XX",
      "assets": {"research_pack_path": str, "script_markdown": str,
                 "blog_markdown": str, "thumbnail_prompt": str},
      "quality_report": {"overall_score": float, "fact_checks_passed": bool,
                         "copyright_clean": bool}
    }
    """
```

## Inputs / Outputs
- **Input:** `topic_opportunity` (dict from the Trend Intelligence / backlog table).
- **Output:** asset bundle + quality report (see signature).

## Backend dependency
- `content_assets` table (Railway Postgres) is live; `qualityLoopWorkflow` creates the row at the
  *start* of the loop (not just at editorial-review time), so iteration state and accumulated
  revision feedback are durable -- a worker restart resumes exactly where it left off instead of
  losing all progress, the same way every other Temporal workflow in this codebase is durable.
- `agent_runs` table is not used; `content_assets.status` (`DRAFT`/`NEEDS_REVISION`/`UNDER_REVIEW`/
  `APPROVED`/`REJECTED`) tracks the run's state instead.

## Model
Runs on the Chief Editor's reasoning model (gemini-direct/gemini-2.5-flash) — judgment/coordination.
