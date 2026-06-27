---
name: submit-editorial-review
description: Push a completed asset bundle to the human editorial review queue and suspend the workflow until an editor votes PASS or REJECT (Human-in-the-Loop gate). Use when a content run has cleared the quality threshold and needs human approval before publishing.
metadata:
  agent: chief-editor
  source: Project Atlas Agent Skills Manifest §1
  layer: executive
---

# submit-editorial-review

Move a run from machine-approved to human-approved via the HITL gate.

## When to use
- `orchestrate-content-run` produced a bundle that passed the quality score.
- A run's status must move `DRAFT` → `UNDER_REVIEW` and wait for a human vote.

## Workflow
1. Push assets to the NestJS editorial dashboard queue.
2. Set `content_assets.status = UNDER_REVIEW`; emit editor notification.
3. Suspend the workflow until a human votes PASS/REJECT.
4. PASS → `APPROVED` → call `dispatch-hermes-content-run` to trigger Hermes's production pipeline. REJECT → return to `orchestrate-content-run` with notes.

## Function signature (manifest contract)
```python
def submit_for_editorial_review(run_id: str, assets: dict) -> bool:
    """Push assets to the editorial queue; suspend until a human votes PASS/REJECT."""
```

## Inputs / Outputs
- **Input:** `run_id`, `assets` bundle.
- **Output:** `bool` (queued successfully); workflow resumes on the human vote.

## Implementation
1. The `content_assets` row already exists by this point -- `qualityLoopWorkflow` (orchestrate-content-run) created it at the *start* of the quality loop, not here. Just `UPDATE content_assets SET status = 'UNDER_REVIEW' WHERE id = :contentAssetId`.
2. Call the `temporal-bridge` MCP tool `start_workflow("editorialReviewWorkflow", "editorial-review", [{"contentAssetId": <id>}])`, and store the returned `workflow_id` on that `content_assets` row as `temporal_workflow_id` (the `POST /api/reviews/:id/vote` REST endpoint signals this instance when a human votes).
3. Call `get_workflow_result(workflow_id)` -- this blocks (up to a 30-day SLA timeout) until a human hits PASS/REJECT on the review queue (`GET /api/reviews/pending`, `POST /api/reviews/:id/vote`, both on the live NestJS server, guarded by `REVIEWER_TOKEN`, with a `/reviews` page in the frontend).
4. PASS → `APPROVED` → call `dispatch-hermes-content-run`. REJECT → return to `orchestrate-content-run` with the vote's `notes`.

## Backend dependency
- NestJS `content_assets` table, `ReviewController` (`server/src/modules/review/`), and the `/reviews`
  frontend page (`src/ReviewsView.tsx`) are all live.

## Model
Chief Editor model (gemini-direct/gemini-2.5-flash).
