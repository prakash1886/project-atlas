---
name: draft-video-script
description: Apply three-act structural scripting (Hook → Conflict → Escalation → Resolution → Lesson) to draft complete narration with opening hooks, visual cues and chapter divisions from a factual dossier and psych profile. Use when the Narrative & Psychology agent must write the actual script for an approved topic.
metadata:
  agent: narrative-psychology
  source: Project Atlas Agent Skills Manifest §5
  layer: L5-content
---

# draft-video-script

Write the documentary script from facts + psychology.

## When to use
- A dossier (gather-citations) and psych profile (generate-psych-profile) exist for a topic.

## Structure (spec §3.5)
Hook (first 3s) → Conflict → Escalation → Resolution → Lesson. Open mid-conflict or on the most
surprising fact — never a slow setup. Include visual cues and chapter divisions.

## Function signature (manifest contract)
```python
def draft_video_script(factual_dossier: dict, psych_profile: dict, duration_minutes: int) -> dict:
    """Draft complete narration incl. hooks, visual cues, and chapter divisions."""
```

## Inputs / Outputs
- **Input:** `factual_dossier`, `psych_profile`, `duration_minutes`.
- **Output:** `{title, hook, chapters: [{heading, narration, visual_cue}], lesson, word_count}`.

## Copyright-safe (spec §2.5)
Original narrative built from facts only — never rewrite a source article.

## Backend dependency
- Persists `script_markdown` to the asset bundle / object storage (Railway/R2). **Stubbed** until wired.

## Model
gemini-direct/gemini-2.5-flash — premium narrative design. Output-heavy: do NOT compress input (spec §11.3).
