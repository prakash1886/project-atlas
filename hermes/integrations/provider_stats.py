"""Tracks per-provider success/failure outcomes for visual-generation's veo/
higgsfield shots and music-generation's lyria tracks, so Asset Planner's provider
choice can be checked against real recent reliability instead of trusted blindly
every run. Pure bookkeeping against a small local JSON file — no LLM call, no new
model; visual-generation/music-generation already compute success/failure per job
in their audit phases, this just persists that across runs.
"""
import json
import os

STATS_PATH = os.getenv("PROVIDER_STATS_PATH") or os.path.join(
    os.path.dirname(__file__), "..", "data", "provider_stats.json"
)
WINDOW = 20  # recent outcomes kept per provider
MIN_SAMPLES_FOR_OVERRIDE = 5  # don't act on a handful of early runs


def _load() -> dict:
    if not os.path.exists(STATS_PATH):
        return {}
    try:
        with open(STATS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _save(stats: dict) -> None:
    os.makedirs(os.path.dirname(STATS_PATH), exist_ok=True)
    with open(STATS_PATH, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)


def record_outcome(provider: str, succeeded: bool) -> None:
    stats = _load()
    outcomes = stats.setdefault(provider, [])
    outcomes.append(succeeded)
    stats[provider] = outcomes[-WINDOW:]
    _save(stats)


def failure_rate(provider: str) -> tuple:
    """Returns (failure_rate, sample_size). failure_rate is None when there aren't
    enough recent samples yet (MIN_SAMPLES_FOR_OVERRIDE) to act on the number."""
    outcomes = _load().get(provider, [])
    if len(outcomes) < MIN_SAMPLES_FOR_OVERRIDE:
        return None, len(outcomes)
    failures = sum(1 for ok in outcomes if not ok)
    return failures / len(outcomes), len(outcomes)
