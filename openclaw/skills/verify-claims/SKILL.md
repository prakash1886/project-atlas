---
name: verify-claims
description: Cross-reference draft script claims against verified fact databases and flag numerical, date, or relational contradictions with severity. Use when the Research & Fact-Check agent must audit a draft before it advances to editorial review. High-stakes claims about real people/events warrant a cross-model second opinion (spec §11.3).
metadata:
  agent: research-factcheck
  source: Project Atlas Agent Skills Manifest §4
  layer: L5-content-verify
---

# verify-claims

Audit a draft for factual contradictions before publish.

## When to use
- A draft script/blog exists and must pass fact-checking before `submit-editorial-review`.

## Function signature (manifest contract)
```python
def verify_claims(draft_text: str) -> dict:
    """
    Returns:
    {
      "verified_claims_count": int,
      "flagged_contradictions": [
        {"claim": str, "contradiction": str, "severity": "HIGH"|"LOW"}
      ],
      "pass_validation": bool
    }
    """
```

## Inputs / Outputs
- **Input:** `draft_text`.
- **Output:** verification report (see signature). `pass_validation=false` blocks publish.

## Cross-model validation (spec §11.3)
For claims that name a real person/culture or where confidence is low, escalate to a
**different provider** (Gemini) for a second opinion — conditional, ~5–10% sampling, not every call.

## Backend dependency
- Reads the graph/citation store (Railway) gathered by `gather-citations`. **Stubbed** until wired.

## Model
Primary deepseek-direct/deepseek-chat; conditional cross-check gemini-direct/gemini-2.5-flash.
