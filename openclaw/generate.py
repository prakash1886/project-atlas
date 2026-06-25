#!/usr/bin/env python3
"""Generate OpenClaw agent personas + skill packages from atlas-agents.json.

Emits, for each granular agent (decomposed into 3 Amigos):
  agents/<id>/SOUL.md      (persona / system prompt)
  skills/<skill>/SKILL.md  (capability package)
and a machine-readable deploy-list.txt consumed by deploy.sh.

Run: python openclaw/generate.py
"""
import json
import os
import pathlib
import shutil

ROOT = pathlib.Path(__file__).resolve().parent
data = json.loads((ROOT / "atlas-agents.json").read_text(encoding="utf-8"))
MODELS = data["models"]

HOST_NOTE = {
    "vps": "",
    "railway": " (production host: Railway — colocated with the graph/vector store, spec §11.1)",
    "modal": " (production host: Modal/Gemma, spec §11.1)",
}

def model_id(a):
    return MODELS[a["model"]]

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

def remove_dir(path):
    if path.exists() and path.is_dir():
        shutil.rmtree(path)

def expand_agent(a):
    if a.get("amigos") is False:
        return [a]
    
    if isinstance(a.get("amigos"), list):
        expanded = []
        for am in a["amigos"]:
            sub = a.copy()
            sub["id"] = f"{a['id']}-{am['role']}"
            sub["name"] = f"{a['name']} {am['role'].capitalize()}"
            sub["skill"] = am["skill"]
            sub["model"] = am.get("model", a["model"])
            sub["emoji"] = am.get("emoji", a["emoji"])
            sub["purpose"] = f"Sub-agent for {am['role'].capitalize()} operations: {a['purpose']}"
            expanded.append(sub)
        return expanded

    # Default 3 Amigos expansion (Creator, Compiler, Auditor)
    return [
        {
            "id": f"{a['id']}-creator",
            "name": f"{a['name']} Creator",
            "emoji": "🎨",
            "layer": a["layer"],
            "host": a["host"],
            "model": a["model"],
            "skill": f"{a['skill']}-creator",
            "purpose": f"Focus on sourcing, drafting, and creative selection for: {a['purpose']}",
            "inputs": a["inputs"],
            "output": f"Draft proposal and creative options for: {a['output']}",
            "section": a["section"],
            "note": a.get("note")
        },
        {
            "id": f"{a['id']}-compiler",
            "name": f"{a['name']} Compiler",
            "emoji": "⚙️",
            "layer": a["layer"],
            "host": a["host"],
            "model": a["model"],
            "skill": f"{a['skill']}-compiler",
            "purpose": f"Focus on structural integrity, schemas, and format alignment for: {a['purpose']}",
            "inputs": f"Draft proposal from Creator + original inputs: {a['inputs']}",
            "output": f"Compiled and formatted candidate structure for: {a['output']}",
            "section": a["section"],
            "note": a.get("note")
        },
        {
            "id": f"{a['id']}-auditor",
            "name": f"{a['name']} Auditor",
            "emoji": "🔍",
            "layer": a["layer"],
            "host": a["host"],
            "model": "reason",  # Auditing requires premium reasoning by default
            "skill": f"{a['skill']}-auditor",
            "purpose": f"Focus on fact-checking, safety policies, and final validation for: {a['purpose']}",
            "inputs": f"Compiled candidate from Compiler + original sources: {a['inputs']}",
            "output": f"Validated final output: {a['output']} (approved or rejected with feedback)",
            "section": a["section"],
            "note": a.get("note")
        }
    ]

agents_dir = ROOT / "agents"
skills_dir = ROOT / "skills"
deploy_rows = []
n_a = n_s = 0

# First, clean up old monolithic outputs of granular agents to avoid pollution
for a in data["agents"]:
    remove_dir(agents_dir / a["id"])
    remove_dir(skills_dir / a["skill"])

# Generate sub-agents and sub-skills
for a in data["agents"]:
    sub_agents = expand_agent(a)
    for sub in sub_agents:
        ad = agents_dir / sub["id"]
        ad.mkdir(parents=True, exist_ok=True)
        (ad / "SOUL.md").write_text(soul(sub), encoding="utf-8")
        n_a += 1
        
        sd = skills_dir / sub["skill"]
        sd.mkdir(parents=True, exist_ok=True)
        (sd / "SKILL.md").write_text(skill(sub), encoding="utf-8")
        n_s += 1
        
        deploy_rows.append("|".join([sub["id"], model_id(sub), sub["emoji"], sub["name"], sub["host"], sub["skill"]]))

(ROOT / "deploy-list.txt").write_text("\n".join(deploy_rows) + "\n", encoding="utf-8")
print(f"Generated {n_a} agents, {n_s} skills, {len(deploy_rows)} deploy rows under Three Amigos architecture.")
