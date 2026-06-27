"""Soul Reference execution agent. Gets-or-creates the Higgsfield soul_id Visual
Generation needs for character continuity. See soul.txt for the phase breakdown.

Cache is a flat JSON file, not a database — Hermes has no DB driver wired in yet
(see config.yaml's production_agents note). Migrating this into the Knowledge
Graph's Personality nodes (spec §2.3) is a known follow-up once that connection
exists, not something faked here.
"""
import datetime
import json
import os
from integrations import higgsfield_client

_CACHE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "soul_ids.json")


def _load_cache() -> dict:
    if os.path.exists(_CACHE_PATH):
        with open(_CACHE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def _save_cache(cache: dict) -> None:
    os.makedirs(os.path.dirname(_CACHE_PATH), exist_ok=True)
    with open(_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2)


def create_lookup(personality_id: str) -> dict:
    """creator phase: check the cache before training anything new."""
    cache = _load_cache()
    return {"personality_id": personality_id, "cached_soul_id": cache.get(personality_id)}


async def compile_result(lookup: dict, image_urls: list, personality_name: str) -> dict:
    """compiler phase: cache hit short-circuits; cache miss trains a new soul_id."""
    if lookup["cached_soul_id"]:
        return {"personality_id": lookup["personality_id"], "soul_id": lookup["cached_soul_id"], "source": "cache_hit", "status": "succeeded"}

    result = {"personality_id": lookup["personality_id"], "source": "newly_trained"}
    try:
        submitted = await higgsfield_client.create_soul_id(personality_name, image_urls)
        soul_id = submitted.get("soul_id") or submitted.get("id")
        trained = await higgsfield_client.wait_for_soul_id(soul_id)
        if trained.get("status") in ("ready", "trained", "succeeded"):
            result["soul_id"] = soul_id
            result["status"] = "succeeded"
        else:
            result["status"] = "failed"
            result["error"] = f"Higgsfield soul-id training ended in status '{trained.get('status')}'"
    except TimeoutError:
        result["status"] = "timed_out"
    except Exception as exc:
        result["status"] = "failed"
        result["error"] = str(exc)
    return result


def audit_result(result: dict) -> dict:
    """auditor phase: only cache a soul_id that actually finished training successfully."""
    if result["status"] == "succeeded" and result["source"] == "newly_trained":
        cache = _load_cache()
        cache[result["personality_id"]] = result["soul_id"]
        _save_cache(cache)
    return {"generated_at": datetime.datetime.utcnow().isoformat() + "Z", **result}


async def run(payload: dict) -> dict:
    lookup = create_lookup(payload["personality_id"])
    result = await compile_result(lookup, payload.get("image_urls", []), payload.get("personality_name", payload["personality_id"]))
    return audit_result(result)
