---
name: audit-trademark-compliance
description: Query public trademark databases to ensure generated design text or quotes do not violate registered intellectual property. Use when the Commerce & Design agent must gate a merch concept before it becomes a designer task or listing. Also a checkpoint for the Envato-incorporation and FTC/AI-disclosure gates (spec §10.5/§10.8).
metadata:
  agent: commerce-design
  source: Project Atlas Agent Skills Manifest §6
  layer: L6-commerce
---

# audit-trademark-compliance

IP/trademark safety gate for merch concepts.

## When to use
- Before a design prompt/brief becomes a `designer_task`, and before any listing is published.

## Function signature (manifest contract)
```python
def audit_trademark_compliance(design_text: str) -> dict:
    """Query trademark DB APIs; return whether the text violates registered IP."""
```

## Inputs / Outputs
- **Input:** `design_text` (slogan/quote/title on the product).
- **Output:** `{clean: bool, conflicts: [{mark, owner, jurisdiction}], recommendation}`.

## Related gates (spec §10)
- Envato incorporation gate (§10.5): require an `incorporated_description` for any Envato-sourced asset.
- FTC affiliate disclosure + Redbubble AI-disclosure (§10.8/§10.1) before publish.

## Backend dependency
- Trademark DB API (e.g. USPTO/EUIPO) — key/integration not present yet. **Stubbed.**
- Writes outcome to `designer_tasks.review_outcome` (Railway).

## Model
deepseek-direct/deepseek-chat to summarize matches; deterministic pass/fail on exact-mark hits.
