---
name: generate-design-prompt
description: Translate the central themes of an approved script into minimal, premium image-generation prompts (Flux/DALL-E) suitable for a product type. Use when the Commerce & Design agent must turn a topic into designer-ready merch concepts. Output is reference material for a human designer, never the final uploaded artwork (human-in-the-loop, spec §10).
metadata:
  agent: commerce-design
  source: Project Atlas Agent Skills Manifest §6
  layer: L6-commerce
---

# generate-design-prompt

Turn approved themes into premium, minimal design prompts.

## When to use
- A merch opportunity is detected for a topic/archetype and a designer brief is being built.

## Function signature (manifest contract)
```python
def generate_design_prompt(topic: str, product_type: str) -> str:
    """Translate themes into a minimal, premium image-generation prompt."""
```

## Inputs / Outputs
- **Input:** `topic`, `product_type` (poster|shirt|journal|sticker|...).
- **Output:** a single prompt string (plus optional style notes).

## Human-in-the-loop (spec §10.1)
Output is **reference/raw material for a human designer** — agents do research & ideation;
humans create and upload the sellable artwork (Redbubble AI-disclosure / IP-risk rules).

## Implementation
Call the `hermes-bridge` MCP tool `run_judgment_agent(insight_type="generate-design-prompt", query=<ask>, context={"topic": topic, "product_type": product_type})`. Hits Hermes's `POST /v1/agents/generate-design-prompt` (new `hermes/agents/generate-design-prompt/`), same self-correcting LLM loop / mock-fallback pattern as `vibe`/`voice-director`.

## Backend dependency
- Attaching the result to `merch_briefs` / `designer_tasks` (Railway) is still **stubbed** until the Postgres/AGE backbone is wired -- the prompt-generation call itself works today, it just isn't durably tracked yet.
- Envato Elements MCP for human-made raw assets (spec §10.4) — separate integration.

## Model
deepseek-direct/deepseek-chat (medium) for prompt crafting.
