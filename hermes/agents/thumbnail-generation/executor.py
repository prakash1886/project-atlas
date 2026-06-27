"""Thumbnail Generation execution agent. Consumes the Thumbnail agent's text
concepts[] (spec §3.5) and produces the actual base image per concept via
Higgsfield. text_overlay is passed through, not rendered here — see soul.txt.
"""
import datetime
from integrations import higgsfield_client

IMAGE_MODEL = "nano_banana_2"


def create_jobs(concepts: list) -> list:
    """creator phase: fold focal_emotion into the prompt per concept."""
    jobs = []
    for concept in concepts or []:
        prompt = f"{concept['prompt']}, conveying {concept['focal_emotion']}, YouTube thumbnail composition"
        jobs.append({"prompt": prompt, "text_overlay": concept["text_overlay"]})
    return jobs


async def compile_results(jobs: list) -> list:
    """compiler phase: submit + poll each generation job."""
    variants = []
    for job in jobs:
        variant = {"prompt": job["prompt"], "text_overlay": job["text_overlay"]}
        try:
            submitted = await higgsfield_client.create_generation(model=IMAGE_MODEL, prompt=job["prompt"])
            result = await higgsfield_client.wait_for_job(submitted["job_id"])
            variant["image_url"] = result.get("output_url")
            variant["status"] = "succeeded" if result.get("status") in ("succeeded", "completed") else "failed"
        except TimeoutError:
            variant["status"] = "timed_out"
        except Exception as exc:
            variant["status"] = "failed"
            variant["error"] = str(exc)
        variants.append(variant)
    return variants


def audit_results(variants: list) -> dict:
    """auditor phase: flag failed concepts rather than silently shrinking the A/B set."""
    failed = [v for v in variants if v["status"] != "succeeded"]
    return {
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "variants": variants,
        "failed_variant_count": len(failed),
    }


async def run(payload: dict) -> dict:
    jobs = create_jobs(payload.get("concepts", []))
    variants = await compile_results(jobs)
    return audit_results(variants)
