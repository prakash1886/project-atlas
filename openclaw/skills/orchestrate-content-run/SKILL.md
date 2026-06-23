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
1. Instantiate a `content_assets` record → status `DRAFT`.
2. Dispatch sub-agents (research-factcheck, narrative-psychology) for the topic.
3. Collect the asset bundle; compute the overall quality score.
4. If `quality_report.overall_score < 90`, loop back with targeted feedback (max iterations enforced).
5. On pass, hand off to `submit-editorial-review`.

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
- `content_assets` / `agent_runs` tables (Railway Postgres) — **stubbed** until backbone wired.
- Sub-agent dispatch uses OpenClaw agent-to-agent routing.

## Model
Runs on the Chief Editor's reasoning model (gemini-direct/gemini-2.5-flash) — judgment/coordination.
