"""Deterministic local media probing — duration only. Compositing/captioning now run
on Remotion/Lambda (see remotion_client.py), not ffmpeg, so this module no longer
does any concat/mux/subtitle-burn work. Still shells out to `ffprobe`, which must be
on PATH wherever narration-synthesis/music-generation run (Railway buildpack/nixpacks
needs an apt/nix package adding it — note for the deploy config, not handled here).
"""
import asyncio
import json


async def probe_duration_seconds(media_path: str) -> float:
    proc = await asyncio.create_subprocess_exec(
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "json", media_path,
        stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"ffprobe failed on {media_path}: {stderr.decode(errors='ignore')}")
    return float(json.loads(stdout.decode(errors="ignore"))["format"]["duration"])
