#!/usr/bin/env python3
"""Generate OpenClaw agent personas + skill packages from atlas-agents.json.

Emits, for each granular agent:
  agents/<id>/SOUL.md      (persona / system prompt)
  skills/<skill>/SKILL.md  (capability package)
and a machine-readable deploy-list.txt consumed by deploy.sh.

Run: python openclaw/generate.py
"""
import json, os, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
data = json.loads((ROOT / "atlas-agents.json").read_text(encoding="utf-8"))
MODELS = data["models"]

HOST_NOTE = {
    "vps": "",
    "railway": " (production host: Railway — colocated with the graph/vector store, spec §11.1)",
    "modal": " (production host: Modal/Gemma, spec §11.1)",
}

def model_id(a): return MODELS[a["model"]]

def tier_note(a):
    if a.get("compute"):
        return ("This agent's core work is statistical/deterministic — compute in Python at zero "
                "LLM cost; call the model only to interpret a result or resolve ambiguity (spec §11.3).")
    if a["model"] == "reason":
        return "Premium reasoning tier (spec §2.4/§11.3); preserve nuance, do not over-compress input."
    return "Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2)."

def soul(a):
    note = ("\n## Note\n" + a["note"] + "\n") if a.get("note") else ""
    return f"""# {a['name']} {a['emoji']}

You are the **{a['name']}** agent in Project Atlas ({a['layer']}).

## Role
{a['purpose']}

## Inputs / Sources
{a['inputs']}

## Output
{a['output']}

## How you work
Use your **{a['skill']}** skill to perform your function, then hand the structured output to the
next agent in the pipeline (coordinated by the Chief Editor / DS-Star backlog).
{note}
## Rules
- All durable state lives in PostgreSQL / Apache AGE / PGVector, never in your own memory (spec §2.3).
- {tier_note(a)}
- Copyright-safe: store only facts, events, dates, relationships and reference metadata (spec §2.5).

Model: {model_id(a)}{HOST_NOTE[a['host']]}
"""

def skill(a):
    backend = ("Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). "
               "**BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).")
    return f"""---
name: {a['skill']}
description: {a['purpose']} Use when the {a['name']} agent must act on its inputs and produce its defined output.
metadata:
  agent: {a['id']}
  source: Project Atlas Requirements §{a['section']}
  layer: {a['layer']}
  host: {a['host']}
---

# {a['skill']}

{a['purpose']}

## When to use
- When the {a['name']} agent is invoked in the {a['layer']} pipeline and its inputs are available.

## Inputs / Sources
{a['inputs']}

## Output
{a['output']}

## Backend dependency
{backend}

## Model
{model_id(a)} — {tier_note(a)}
"""

agents_dir = ROOT / "agents"
skills_dir = ROOT / "skills"
deploy_rows = []
n_a = n_s = 0
for a in data["agents"]:
    ad = agents_dir / a["id"]; ad.mkdir(parents=True, exist_ok=True)
    (ad / "SOUL.md").write_text(soul(a), encoding="utf-8"); n_a += 1
    sd = skills_dir / a["skill"]; sd.mkdir(parents=True, exist_ok=True)
    (sd / "SKILL.md").write_text(skill(a), encoding="utf-8"); n_s += 1
    deploy_rows.append("|".join([a["id"], model_id(a), a["emoji"], a["name"], a["host"], a["skill"]]))

(ROOT / "deploy-list.txt").write_text("\n".join(deploy_rows) + "\n", encoding="utf-8")
print(f"generated {n_a} agents, {n_s} skills, {len(deploy_rows)} deploy rows")
