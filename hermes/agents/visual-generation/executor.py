"""Visual Generation execution agent. Consumes Asset Planner's veo_prompts[] /
higgsfield_prompts[] (spec §3.5) and produces finished clip URLs. See soul.txt for
the creator/compiler/auditor phase breakdown.
"""
import datetime
from integrations import veo_client, higgsfield_client


def create_jobs(veo_prompts: list, higgsfield_prompts: list, soul_id: str = None) -> list:
    """creator phase: build one job spec per prompt, tagging provider + shot order."""
    jobs = []
    shot_index = 0
    for prompt in veo_prompts or []:
        jobs.append({"shot_index": shot_index, "provider": "veo", "prompt": prompt})
        shot_index += 1
    for prompt in higgsfield_prompts or []:
        jobs.append({"shot_index": shot_index, "provider": "higgsfield", "prompt": prompt, "soul_id": soul_id})
        shot_index += 1
    return jobs


async def compile_results(jobs: list) -> list:
    """compiler phase: submit + poll each job, normalize into the shared clip schema."""
    clips = []
    for job in jobs:
        clip = {"shot_index": job["shot_index"], "provider": job["provider"], "prompt": job["prompt"]}
        try:
            if job["provider"] == "veo":
                op = await veo_client.create_generation(job["prompt"])
                result = await veo_client.wait_for_operation(op["name"])
                clip["clip_url"] = result.get("response", {}).get("videos", [{}])[0].get("gcsUri")
                clip["status"] = "succeeded" if clip["clip_url"] else "failed"
            else:
                submitted = await higgsfield_client.create_generation(
                    model="cinematic_studio_video_3_5", prompt=job["prompt"], soul_id=job.get("soul_id")
                )
                result = await higgsfield_client.wait_for_job(submitted["job_id"])
                clip["clip_url"] = result.get("output_url")
                clip["status"] = "succeeded" if result.get("status") in ("succeeded", "completed") else "failed"
        except TimeoutError:
            clip["status"] = "timed_out"
        except Exception as exc:
            clip["status"] = "failed"
            clip["error"] = str(exc)
        clips.append(clip)
    return clips


def audit_results(clips: list) -> dict:
    """auditor phase: surface failures instead of letting them silently drop from the sequence."""
    failed = [c for c in clips if c["status"] != "succeeded"]
    return {
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "clips": clips,
        "failed_shot_count": len(failed),
    }


async def run(payload: dict) -> dict:
    jobs = create_jobs(
        payload.get("veo_prompts", []),
        payload.get("higgsfield_prompts", []),
        payload.get("soul_id"),
    )
    clips = await compile_results(jobs)
    return audit_results(clips)
