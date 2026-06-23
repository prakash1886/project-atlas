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
4. PASS → `APPROVED` → trigger publishing worker. REJECT → return to `orchestrate-content-run` with notes.

## Function signature (manifest contract)
```python
def submit_for_editorial_review(run_id: str, assets: dict) -> bool:
    """Push assets to the editorial queue; suspend until a human votes PASS/REJECT."""
```

## Inputs / Outputs
- **Input:** `run_id`, `assets` bundle.
- **Output:** `bool` (queued successfully); workflow resumes on the human vote.

## Backend dependency
- NestJS editorial dashboard queue + `content_assets` status (Railway). **Stubbed** until wired.
- Suspension/resume is modeled on a Temporal signal in production.

## Model
Chief Editor model (gemini-direct/gemini-2.5-flash).
