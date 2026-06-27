---
name: generate-psych-profile
description: Extract the core motivations, decisions under pressure, cognitive biases and mental models of a subject (historical figure / topic subject) to drive psychology-led narrative. Use when the Narrative & Psychology agent must understand WHY a subject acted as they did before drafting a script.
metadata:
  agent: narrative-psychology
  source: Project Atlas Agent Skills Manifest §5
  layer: L3-story
---

# generate-psych-profile

Produce a psychological profile that turns facts into meaning.

## When to use
- Before drafting a documentary script for a personality/topic.
- Feeding the `psychological_arcs` record (identity, struggle, failure, growth, resilience, reinvention, legacy — spec §4.2).

## Function signature (manifest contract)
```python
def generate_psych_profile(subject_entity: str) -> dict:
    """Extract motivations, decisions under pressure, biases, and mental models."""
```

## Inputs / Outputs
- **Input:** `subject_entity` (name or entity id).
- **Output:** `{focus, motivations[], biases[], mental_models[], arc: {identity, struggle, failure, growth, resilience, reinvention, legacy}}`.

## Implementation
Call the `hermes-bridge` MCP tool `run_judgment_agent(insight_type="generate-psych-profile", query=<ask>, context={"subject_entity": subject_entity})`. Hits Hermes's `POST /v1/agents/generate-psych-profile` (new `hermes/agents/generate-psych-profile/`), the same self-correcting LLM loop / mock-fallback pattern as `vibe`/`voice-director`. Caveat: this is LLM judgment from training-data knowledge, not retrieval against the actual graph/dossier yet -- treat the output as a first draft until `gather-citations` + `query-semantic-nodes` are feeding it real context.

## Backend dependency
- Persisting to `psychological_arcs` (Railway) is still **stubbed** until the Postgres/AGE backbone is wired -- the judgment call itself works today, it just isn't durably stored yet.
- Deep biography discovery via **Exa** (key not present yet).

## Model
gemini-direct/gemini-2.5-flash — premium reasoning (psychological judgment, spec §2.4/§11.3).
Skip/limit prompt compression here (nuance matters).
