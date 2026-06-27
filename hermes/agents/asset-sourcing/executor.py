"""Asset Sourcing execution agent. Consumes Asset Planner's broll[]/music[]/images[]
(spec §3.5/§10.2). See soul.txt for the creator/compiler/auditor phase breakdown.
"""
import datetime
import os
from integrations import envato_client, storage_client

_ENVATO_TYPE_BY_ASSET_TYPE = {"broll": "stock-video", "music": "music", "image": "stock-photo"}


async def create_jobs(broll: list, music: list, images: list) -> list:
    """creator phase: resolve each Asset Planner query string to a concrete Envato item_id."""
    jobs = []
    for asset_type, queries in (("broll", broll), ("music", music), ("image", images)):
        for query in queries or []:
            job = {"query": query, "asset_type": asset_type}
            try:
                results = await envato_client.search_items(query, _ENVATO_TYPE_BY_ASSET_TYPE[asset_type])
                items = results.get("items", [])
                job["item_id"] = items[0]["id"] if items else None
            except Exception:
                job["item_id"] = None
            jobs.append(job)
    return jobs


async def compile_results(jobs: list) -> list:
    """compiler phase: download each resolved item, then re-upload it so Video
    Assembly's Remotion render on AWS Lambda has a URL it can fetch — Envato's
    download endpoint is authenticated and not something Lambda can call directly."""
    assets = []
    for job in jobs:
        asset = {"query": job["query"], "asset_type": job["asset_type"]}
        if not job.get("item_id"):
            asset["status"] = "no_match"
            assets.append(asset)
            continue
        try:
            content = await envato_client.download_item(job["item_id"])
            file_path = os.path.join("/tmp", f"envato-{job['item_id']}")
            with open(file_path, "wb") as f:
                f.write(content)
            asset_url = storage_client.upload_and_get_url(file_path, job["asset_type"])
            asset.update({
                "item_id": job["item_id"], "file_path": file_path, "asset_url": asset_url, "status": "succeeded",
            })
        except Exception:
            asset["status"] = "failed"
        assets.append(asset)
    return assets


def audit_results(assets: list) -> dict:
    """auditor phase: surface unresolved/failed assets instead of letting Video Assembly
    silently receive a shorter asset list than Asset Planner intended."""
    unresolved = [a for a in assets if a["status"] != "succeeded"]
    return {
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "assets": assets,
        "unresolved_count": len(unresolved),
    }


async def run(payload: dict) -> dict:
    jobs = await create_jobs(payload.get("broll", []), payload.get("music", []), payload.get("images", []))
    assets = await compile_results(jobs)
    return audit_results(assets)
