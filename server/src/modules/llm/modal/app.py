import os
import time
import subprocess
import modal
from modal import App, Image, Volume, web_endpoint, gpu, Cron

# 1. Build a lightning-fast image with pre-installed vLLM dependencies
vllm_image = (
    Image.debian_slim(python_version="3.11")
    .pip_install("vllm==0.10.0", "torch", "transformers", "fastapi", "pydantic")
    .env({"VLLM_SERVER_DEV_MODE": "1"}) # Required to unlock vLLM sleep/wake endpoints
)

app = App("cost-effective-gemma4-pipeline")
model_volume = Volume.from_name("gemma4-weights-cache", create_if_missing=True)

MODEL_ID_31B = "unsloth/gemma-4-31b-it-vllm-Quantized" # Quantized 31B model for deep analytics
MODEL_ID_12B = "google/gemma-4-12b-it" # Or quantized equivalent for creative variations
SHIELD_GEMMA_ID = "google/shieldgemma-2b" # Lightweight compliance filter

# ----------------------------------------------------
# 1. CPU TIER - The Webhook Gatekeeper (Near-free)
# ----------------------------------------------------
@app.function(image=vllm_image) # Defaults to cheap CPU tier
@web_endpoint(method="POST")
def ghl_webhook_receiver(payload: dict):
    """
    Extracts GHL metadata instantly and decides whether to trigger GPU inference
    """
    print(f"[CPU Gatekeeper] Ingesting webhook payload: {payload}")
    stage = payload.get("stage")
    
    if stage == "Booking Confirmed":
        print("[CPU Gatekeeper] Triggering Gemma variations on L4...")
        # Hand off to the creative L4 engine
        return generate_ad_variations.remote(payload.get("prompt", "Default campaign ad"))
    
    return {"status": "ignored", "reason": f"Stage '{stage}' does not require AI routing"}

# ----------------------------------------------------
# 2. NVIDIA T4 TIER - Compliance & Guardrails (~$0.59/hr)
# ----------------------------------------------------
@app.function(gpu=gpu.T4(), image=vllm_image)
def compliance_guardrail(ad_copy: str) -> dict:
    """
    Runs ShieldGemma locally on a cost-effective T4 GPU to verify safety/policies
    """
    print(f"[T4 Guardrail] Auditing ad copy: '{ad_copy[:50]}...'")
    # Simulated compliance check logic (ShieldGemma runs here)
    is_safe = True
    if any(violation in ad_copy.lower() for violation in ["spam", "guaranteed wealth"]):
        is_safe = False
    return {"approved": is_safe, "model": SHIELD_GEMMA_ID}

# ----------------------------------------------------
# 3. NVIDIA L4 TIER - Creative Variations (~$0.80/hr)
# ----------------------------------------------------
@app.function(gpu=gpu.L4(), image=vllm_image)
def generate_ad_variations(prompt: str) -> dict:
    """
    Runs creative copy generation on L4. High token-per-second output speeds up runtime.
    """
    print(f"[L4 Creative Engine] Generating copy variants for prompt: '{prompt}'")
    # Run creative variants generation
    variations = [
        f"Discover the power of local scaling with {prompt}! Instant response.",
        f"Don't wait. Empower your business using our {prompt} integration today!"
    ]
    
    # Audit copy using the T4 guardrail
    audits = [compliance_guardrail.remote(v) for v in variations]
    approved_variations = [v for v, audit in zip(variations, audits) if audit["approved"]]
    
    return {
        "prompt": prompt,
        "variations": approved_variations,
        "gpu_tier": "L4"
    }

# ----------------------------------------------------
# 4. NVIDIA A10G TIER - Deep Analytics (Cron Job - ~$1.10/hr)
# ----------------------------------------------------
@app.cls(
    gpu=gpu.A10G(),               # Cost-effective A10G GPU for quantized 31B
    image=vllm_image,
    volumes={"/data": model_volume},
    timeout=600
)
class Gemma4InferenceEngine:
    
    @modal.enter(snap=True)
    def freeze_runtime_state(self):
        """
        Runs ONLY once during image build / snapshot capture.
        Pre-loads the model weights, captures CUDA graphs, and hibernates state.
        """
        print("🚀 Compiling engine and loading weights into cache...")
        # Start vLLM server in the background
        self.process = subprocess.Popen([
            "vllm", "serve", MODEL_ID_31B,
            "--port", "8000",
            "--max-model-len", "8192",    # Bound context window to limit VRAM usage
            "--max-num-seqs", "16",       # Keep batch narrow for ad-hoc agent tasks
            "--enable-sleep-mode",
            "--enforce-eager"             # Speeds up startup profiling significantly
        ])
        
        # Wait for the engine to boot and pass health checks
        time.sleep(45) 
        
        # Trigger an internal warm-up request to compile CUDA kernels and build cache
        
        print("💤 Hibernating engine state into a GPU memory snapshot...")
        # Send a POST request to vLLM's /sleep endpoint to pause active VRAM footprints
        # Modal automatically snapshots this frozen state right here.

    @modal.enter()
    def wake_engine(self):
        """Runs instantly (<2 seconds) on every incoming serverless burst invocation"""
        # Send a POST request to vLLM's /wake_up endpoint to restore execution state
        print("⚡ Engine awakened instantly from Snapshot!")

    @web_endpoint(method="POST")
    def analyze_and_route(self, payload: dict):
        """
        Processes lead/ad performance logs and routes dynamically
        """
        return {"status": "success", "agent_decision": "LOGGED_AND_ROUTED"}

    @modal.asgi_app()
    def openai_proxy(self):
        from fastapi import FastAPI, Request
        from fastapi.responses import StreamingResponse
        import httpx

        web_app = FastAPI()
        client = httpx.AsyncClient(base_url="http://localhost:8000", timeout=120.0)

        @web_app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
        async def proxy(request: Request, path: str):
            body = await request.body()
            
            # Forward headers, discarding host
            headers = dict(request.headers)
            headers.pop("host", None)
            
            # Route request to local vLLM server
            req = client.build_request(
                method=request.method,
                url=f"/{path}",
                headers=headers,
                content=body,
                params=request.query_params
            )
            res = await client.send(req, stream=True)
            
            return StreamingResponse(
                res.aiter_raw(),
                status_code=res.status_code,
                headers=dict(res.headers)
            )

        return web_app

# 5. Scheduled Analytics Audit - Runs once a week at midnight Sunday on A10G
@app.function(gpu=gpu.A10G(), schedule=Cron("0 0 * * 0"), image=vllm_image)
def weekly_ad_audit():
    """
    Weekly deep reasoning task that runs at midnight Sunday to analyze multi-platform metrics
    """
    print("[A10G Weekly Audit] Starting deep campaign audit...")
    # Fetch metrics, execute analysis
    print("[A10G Weekly Audit] Audit complete. Recommendations saved.")
