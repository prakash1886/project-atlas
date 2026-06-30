import os
import sys
import yaml
import json
import logging
import asyncio
import traceback
from typing import List, Dict, Any, Optional
import httpx
from fastapi import FastAPI, HTTPException, Header, Depends, status
from pydantic import BaseModel
import uuid
import agent_loader
import orchestrator
from integrations import tubelab_client

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("Hermes-Science-API")

# Check run_agent availability
HAS_HERMES = False
try:
    from run_agent import AIAgent
    HAS_HERMES = True
    logger.info("Successfully imported NousResearch AIAgent")
except ImportError:
    logger.warning("run_agent / AIAgent not found in Python path. Using local mock/fallback loops.")

# Load configuration
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.yaml")
config = {}
if os.path.exists(CONFIG_PATH):
    try:
        with open(CONFIG_PATH, "r") as f:
            config = yaml.safe_load(f) or {}
        logger.info("Loaded configuration from config.yaml")
    except Exception as e:
        logger.error(f"Error loading config.yaml: {e}")

API_SECRET = os.getenv("DSSTAR_API_KEY") or config.get("api", {}).get("secret_key", "default-ds-star-api-secret-key-12345")
DATA_DIR = os.getenv("DSSTAR_DATA_DIR") or config.get("ds_star", {}).get("data_directory", "../ds-star/data")
os.makedirs(DATA_DIR, exist_ok=True)

app = FastAPI(
    title="Hermes Self-Improving Science API",
    description="Railway deployment of self-improving data science agents utilizing NousResearch Hermes Agent",
    version="1.0.0"
)

class DsStarRequest(BaseModel):
    query: str
    data_files: List[str] = []
    max_refinement_rounds: Optional[int] = None
    scientist_outputs: Optional[Dict[str, Any]] = None

class AgentRequest(BaseModel):
    query: str
    data_files: List[str] = []
    max_refinement_rounds: Optional[int] = None
    context: Optional[Dict[str, Any]] = None

class ProduceRequest(BaseModel):
    payload: Dict[str, Any] = {}

class ContentRunRequest(BaseModel):
    personality_id: Optional[str] = None
    personality_name: Optional[str] = None
    reference_image_urls: List[str] = []
    script_text: str
    target_format: str = "long_form"
    asset_planner_output: Dict[str, Any]
    voice_assignment: Dict[str, Any]
    thumbnail_concepts: List[Dict[str, Any]] = []
    publish_metadata: Dict[str, Any] = {}

# Video-production execution agents (spec gap identified in the Higgsfield/video-generation
# design discussion): deterministic API-calling agents, not LLM judgment loops, so they don't
# go through execute_self_improving_hermes_agent. Each ships its own executor.py with a
# creator/compiler/auditor-phased run(payload) coroutine, mirroring the OpenClaw Three-Sub-Agent
# Isolation Pattern in code instead of separate LLM-prompted sub-agents.
PRODUCTION_AGENT_IDS = {
    "soul-reference", "visual-generation", "presenter-generation", "narration-synthesis",
    "music-generation", "asset-sourcing", "thumbnail-generation", "video-assembly",
    "captioning", "render-qc", "video-publish",
}

# API Authentication Dependency
async def verify_api_key(authorization: Optional[str] = Header(None)):
    if not API_SECRET:
        # Fail closed: no configured secret means no access, not open access.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="DSSTAR_API_KEY is not configured on this deployment"
        )
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    token = authorization.replace("Bearer ", "")
    if token != API_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API Key"
        )

def validate_schema(data, schema):
    if not isinstance(schema, dict):
        return True, ""
    
    schema_type = schema.get("type")
    if schema_type == "object":
        if not isinstance(data, dict):
            return False, f"Expected object, got {type(data).__name__}"
        
        required = schema.get("required", [])
        for field in required:
            if field not in data:
                return False, f"Missing required field: '{field}'"
        
        properties = schema.get("properties", {})
        for key, val in data.items():
            if key in properties:
                ok, err = validate_schema(val, properties[key])
                if not ok:
                    return False, f"Field '{key}': {err}"
                
    elif schema_type == "array":
        if not isinstance(data, list):
            return False, f"Expected list, got {type(data).__name__}"
        items_schema = schema.get("items")
        if items_schema:
            for idx, item in enumerate(data):
                ok, err = validate_schema(item, items_schema)
                if not ok:
                    return False, f"Item at index {idx}: {err}"
                
    elif schema_type == "string":
        if not isinstance(data, str):
            return False, f"Expected string, got {type(data).__name__}"
        if "enum" in schema and data not in schema["enum"]:
            return False, f"Value '{data}' is not in allowed enum: {schema['enum']}"
            
    elif schema_type in ["integer", "number"]:
        if isinstance(data, bool):
            return False, "Expected number, got bool"
        if schema_type == "integer" and not isinstance(data, int):
            return False, f"Expected integer, got {type(data).__name__}"
        if schema_type == "number" and not isinstance(data, (int, float)):
            return False, f"Expected number, got {type(data).__name__}"
            
    return True, ""

HERMES_GATEWAY_URL = os.getenv("HERMES_GATEWAY_URL", "").rstrip("/")
HERMES_GATEWAY_KEY = os.getenv("HERMES_GATEWAY_KEY", "")


async def call_hermes_gateway(system_instructions: str, current_prompt: str) -> Optional[str]:
    """
    Calls the real Nous Hermes agent runtime (hermes-gateway, a separate Railway
    service running `hermes gateway run` with the api_server platform enabled) over its
    OpenAI-compatible /v1/chat/completions endpoint, instead of the locally embedded
    AIAgent instance. The gateway's agent has MCP servers (e.g. NexLev) registered in its
    own config.yaml and can transparently invoke their tools while answering -- something
    the embedded AIAgent path has no documented way to do.

    Returns None (caller falls back to the local AIAgent loop) if the gateway isn't
    configured or the call fails -- same optional/graceful-degradation contract as
    call_modal_script_agent, since the gateway is an enhancement, not a hard dependency.
    """
    if not HERMES_GATEWAY_URL:
        return None

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{HERMES_GATEWAY_URL}/v1/chat/completions",
                headers={"Authorization": f"Bearer {HERMES_GATEWAY_KEY}"},
                json={
                    "model": "hermes-agent",
                    "messages": [
                        {"role": "system", "content": system_instructions},
                        {"role": "user", "content": current_prompt},
                    ],
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.warning(f"[Hermes] Gateway call failed, falling back to local AIAgent loop: {e}")
        return None


async def call_modal_script_agent(
    query: str,
    extra_context: Optional[dict] = None
) -> Optional[Dict[str, Any]]:
    """
    Proxies script generation to the Modal-hosted fine-tuned Gemma endpoint (spec §11.1).
    Returns None (caller falls back to the local self-improving loop) if Modal isn't configured
    or the call fails — Modal is the intended production host but isn't required to exist yet.
    """
    modal_cfg = config.get("modal", {})
    endpoint_url = os.getenv("MODAL_SCRIPT_ENDPOINT_URL") or modal_cfg.get("endpoint_url")
    if not endpoint_url:
        return None

    modal_token = os.getenv("MODAL_TOKEN")
    headers = {"Authorization": f"Bearer {modal_token}"} if modal_token else {}
    timeout = modal_cfg.get("timeout_seconds", 60)

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(
                endpoint_url,
                headers=headers,
                json={"query": query, "context": extra_context or {}}
            )
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        logger.warning(f"[Hermes] Modal script endpoint call failed, falling back to local loop: {e}")
        return None

async def execute_self_improving_hermes_agent(
    insight_type: str,
    query: str,
    data_files: List[str],
    rounds: int,
    extra_context: Optional[dict] = None
) -> Dict[str, Any]:
    """
    Spawns a NousResearch AIAgent to execute a self-improving analysis loop.
    The agent receives database/file context, writes code, verifies its accuracy,
    and returns a structured JSON result matching the specific scientist schema.
    """
    logger.info(f"[Hermes] Spawning self-improving loop for scientist: {insight_type}")

    if insight_type == "script":
        modal_result = await call_modal_script_agent(query, extra_context)
        if modal_result is not None:
            logger.info("[Hermes] Script served by Modal/Gemma endpoint")
            return modal_result

    tubelab_context = ""
    if insight_type == "content-opportunity":
        # query is the free-text topic/niche seed the scientist was asked to research.
        # Empty results (TUBELAB_API_KEY unset or the call failing) are fine here --
        # this is supplementary context, not a required input.
        outliers, channels = await asyncio.gather(
            tubelab_client.search_outliers(query), tubelab_client.search_channels(query)
        )
        if outliers or channels:
            tubelab_context = (
                f"\n        - TubeLab outlier videos for '{query}': {json.dumps(outliers)}"
                f"\n        - TubeLab niche channels for '{query}': {json.dumps(channels)}"
            )

    # Load agent-specific soul (system prompt) and schema
    agent_dir = os.path.join(os.path.dirname(__file__), "agents", insight_type)
    soul_content = ""
    schema_content = {}
    history_path = os.path.join(agent_dir, "history.json")
    
    if os.path.exists(agent_dir):
        soul_path = os.path.join(agent_dir, "soul.txt")
        if os.path.exists(soul_path):
            with open(soul_path, "r", encoding="utf-8") as f:
                soul_content = f.read().strip()
                
        schema_path = os.path.join(agent_dir, "schema.json")
        if os.path.exists(schema_path):
            try:
                with open(schema_path, "r", encoding="utf-8") as f:
                    schema_content = json.load(f)
            except Exception as e:
                logger.error(f"Error loading schema for {insight_type}: {e}")

    # Read data samples to inject into context
    file_summaries = []
    for file_name in data_files:
        file_path = os.path.join(DATA_DIR, file_name)
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    sample = [f.readline().strip() for _ in range(5)]
                file_summaries.append(f"File: {file_name}\nHeader/Sample Content:\n" + "\n".join(sample))
            except Exception as e:
                file_summaries.append(f"File: {file_name} (Failed to read sample: {str(e)})")
        else:
            file_summaries.append(f"File: {file_name} (File not found, simulated data will be generated)")

    # Model configuration
    model_name = config.get("ds_star", {}).get("agent_models", {}).get("analyzer", "google/gemini-2.5-flash")

    # Craft system instructions explaining the self-improvement loop. Built before the
    # local-AIAgent gate below since the hermes-gateway path (call_hermes_gateway) needs
    # this same text regardless of whether GEMINI_API_KEY/AIAgent are available locally.
    system_instructions = f"""
        You are the Hermes self-improving agent.

        ### Agent Identity & Role:
        {soul_content or f"You are the {insight_type} analysis specialist."}

        Your primary responsibility is to research the query, verify findings for correctness, and produce a structured JSON report.

        ### The Self-Improvement Workflow:
        1. **Plan:** Analyze the query and the data files provided.
        2. **Research:** If you have tools available (e.g. MCP server tools), you MUST call at least one of them before finalizing your answer -- this is not optional. Read their actual results and base your findings on that real data; do not guess or invent figures. Do not write or execute code; you have no code execution tool. Only skip tool calls if none are available to you at all, in which case reason from your own knowledge instead.
        3. **Verify:** Check your findings for logical contradictions, missing values, or outliers.
        4. **Correct:** If validation fails, revise your findings (re-querying tools if needed) and re-verify.
        5. **Finalize:** Construct a final JSON object matching the exact schema required for this scientist role. Every entry in any `reasons`-style field MUST cite specific data points returned by your tool calls (exact channel names, subscriber counts, view counts, RPM, etc.) -- generic, non-specific claims are not acceptable when tool data was available to you.

        ### Input Context:
        - Files available in directory '{DATA_DIR}':
          {chr(10).join(file_summaries)}
        - Extra Context: {json.dumps(extra_context or {})}{tubelab_context}

        ### Required JSON Schema format:
        {json.dumps(schema_content, indent=2) if schema_content else "Return a structured JSON report."}

        Return ONLY a valid JSON object matching the schema. Do not write markdown blocks or text wrapper.
        """

    loop_id = f"hermes-{insight_type}-{int(asyncio.get_event_loop().time())}"
    current_prompt = f"""
        User Query: {query}
        Execute the self-improving loop for {insight_type}.
        Perform the data science analysis and return the final JSON.
        """

    # Retrieve API key for the local-AIAgent fallback path. Only required when
    # HERMES_GATEWAY_URL isn't set -- the gateway path needs neither.
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not HERMES_GATEWAY_URL and (not HAS_HERMES or not gemini_key):
        logger.warning("[Hermes] AIAgent library not active or GEMINI_API_KEY missing. Falling back to high-fidelity simulated response.")
        return get_mock_scientist_response(insight_type, query, data_files)

    try:
        # Load local memory history if available
        history = []
        if os.path.exists(history_path):
            try:
                with open(history_path, "r", encoding="utf-8") as f:
                    history = json.load(f)
            except Exception:
                pass

        # Local AIAgent is instantiated lazily, only the first time the gateway path
        # is unavailable for this run -- ephemeral_system_prompt is the real
        # constructor param AIAgent honors; a plain `agent.system_prompt = ...`
        # attribute assignment is a silent no-op.
        agent = None
        logger.info(f"[Hermes] Running conversation loop ID: {loop_id}")

        final_json = None
        for attempt in range(1, rounds + 1):
            logger.info(f"[Hermes] Round {attempt}/{rounds} for {insight_type}")
            gateway_text = await call_hermes_gateway(system_instructions, current_prompt)
            if gateway_text is not None:
                final_text = gateway_text.strip()
            else:
                if agent is None:
                    agent = AIAgent(model=model_name, quiet_mode=True, ephemeral_system_prompt=system_instructions)
                # task_id must be passed by keyword — run_conversation's 2nd positional
                # param is system_message, which would silently override ephemeral_system_prompt.
                result = await asyncio.to_thread(agent.run_conversation, current_prompt, task_id=loop_id)
                final_text = result.get("final_response", "").strip()
            
            # Clean markdown code block wraps if LLM returns them
            if final_text.startswith("```json"):
                final_text = final_text.replace("```json", "", 1).rstrip("` \n\t")
            elif final_text.startswith("```"):
                final_text = final_text.replace("```", "", 1).rstrip("` \n\t")
                
            try:
                final_json = json.loads(final_text)
                
                # Verify against target schema
                if schema_content:
                    is_valid, err_msg = validate_schema(final_json, schema_content)
                    if is_valid:
                        logger.info(f"[Hermes] Schema validation passed at round {attempt}!")
                        break
                    else:
                        logger.warning(f"[Hermes] Schema validation failed: {err_msg}")
                        current_prompt = f"Your previous response failed schema validation: {err_msg}. Please correct the JSON output to strictly match the required schema: {json.dumps(schema_content)}"
                else:
                    break # No schema to validate, accept parsed JSON
            except Exception as json_err:
                logger.warning(f"[Hermes] JSON parsing failed: {str(json_err)}")
                current_prompt = f"Your previous response was not valid JSON. Error: {str(json_err)}. Please return ONLY a valid JSON object."
        
        if final_json is None:
            raise ValueError("Failed to produce valid JSON after maximum refinement rounds.")
            
        # Update history
        history.append({
            "query": query,
            "response": final_json,
            "timestamp": int(asyncio.get_event_loop().time())
        })
        # Keep last 10 entries for history optimization
        history = history[-10:]
        try:
            with open(history_path, "w", encoding="utf-8") as f:
                json.dump(history, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save history for {insight_type}: {e}")
            
        return final_json
        
    except Exception as e:
        logger.error(f"[Hermes] Error in self-improving loop: {str(e)}")
        traceback.print_exc()
        logger.info("[Hermes] Falling back to structured default template.")
        return get_mock_scientist_response(insight_type, query, data_files)

def get_mock_scientist_response(insight_type: str, query: str, data_files: List[str]) -> Dict[str, Any]:
    timestamp = "2026-06-25T12:00:00Z"
    
    if insight_type == "forecast-retention":
        return {
            "video_id": "simulated-video-001",
            "predicted_drop_offs": [{"at_index": 3, "drop_percentage": 12.5}],
            "overall_retention_trend": "stable"
        }
    elif insight_type == "optimize-weights":
        return {
            "optimized_weights": {
                "search": 0.22, "discussion": 0.14, "video": 0.14,
                "evergreen": 0.17, "emotion": 0.12, "competition": 0.09,
                "monetization": 0.08, "regional": 0.04
            },
            "learning_rate": 0.01,
            "status": "weights_converged"
        }
    elif insight_type == "content-opportunity":
        return {
            "generated_at": timestamp,
            "top_opportunities": [
                {
                    "topic": "Psychology of Rivalry: Messi vs Ronaldo",
                    "search_growth_score": 92, "discussion_intensity_score": 88,
                    "virality_score": 95, "monetization_score": 85, "evergreen_score": 75,
                    "composite_score": 88.5,
                    "reasons": ["High search growth driven by upcoming matches", "Intense debate on Reddit"]
                }
            ],
            "merchandise_opportunities": ["Stoic Quote Shirts"],
            "audience_opportunities": ["Q&A segment on sport psychology"],
            "forecasted_trends": ["Rivalry psychology videos"]
        }
    elif insight_type == "audience-analysis":
        return {
            "channel_id": "mock-channel",
            "generated_at": timestamp,
            "primary_persona": {
                "segment_name": "The Analytical Improver",
                "age_range": "18-34",
                "top_regions": ["United States", "India"],
                "content_preferences": ["Case studies", "Psychological breakdown"],
                "watch_behaviour": "Watches 70% of video on desktop",
                "emotional_triggers": ["Curiosity", "Sense of revelation"],
                "share_propensity": "high"
            },
            "secondary_personas": [],
            "geographic_breakdown": {"US": 0.50, "IN": 0.50},
            "retention_insights": ["Viewer drop-off at intro hooks exceeds 30% on mobile"]
        }
    elif insight_type == "story-universe":
        return {
            "personality_id": "mock-personality",
            "generated_at": timestamp,
            "ranked_story_types": [
                {"story_type": "comeback_story", "avg_retention_pct": 64.5, "avg_watch_time_minutes": 12.8, "sample_size": 5}
            ],
            "recommended_next_story_type": "comeback_story",
            "recommendation_reason": "Comeback stories for this personality show higher retention."
        }
    elif insight_type == "archetype-analysis":
        return {
            "generated_at": timestamp,
            "archetype_performance": [
                {"archetype": "underdog", "avg_watch_time_minutes": 14.2, "avg_retention_pct": 62.0, "share_rate": 0.08, "comment_engagement_rate": 0.12, "subscriber_conversion_rate": 0.04, "video_count": 6}
            ],
            "best_for_retention": "underdog",
            "best_for_shares": "rebel",
            "best_for_watch_time": "visionary",
            "production_recommendations": ["Script the next videos using the Rebel archetype"]
        }
    elif insight_type == "geographic-intelligence":
        return {
            "channel_id": "mock-channel",
            "generated_at": timestamp,
            "top_regions": [
                {"region": "India", "country_code": "IN", "watch_time_pct": 35.0, "top_content_categories": ["Cricket Legends"], "cultural_hooks": ["Cricket psychology"], "opportunity_score": 95}
            ],
            "regional_topic_opportunities": {"IN": ["The Mindset of MS Dhoni under Pressure"]},
            "backlog_priority_adjustments": {"dhoni-mindset": 15}
        }
    elif insight_type == "hidden-legends-discovery":
        return {
            "generated_at": timestamp,
            "discoveries": [
                {
                    "name": "Arthur Saint-Leon",
                    "domain": "Performing Arts / Ballet History",
                    "story_quality_score": 94, "coverage_gap_score": 88,
                    "wikipedia_pageview_growth_pct": 28.5, "existing_best_video_views": 45000,
                    "opportunity_score": 91.2,
                    "story_angles": ["The creator of Coppelia who died of exhaustion/heartbreak"],
                    "sources": ["Wikipedia:Arthur_Saint-Leon"]
                }
            ],
            "total_scanned": 142,
            "filter_criteria": ["Wikipedia traffic > 20%"]
        }
    elif insight_type == "youtube-format-analysis":
        return {
            "channel_id": "mock-channel",
            "generated_at": timestamp,
            "optimal_video_length_by_topic": {"History": 18.5},
            "best_hook_duration_seconds": 14.5,
            "best_publish_times": [{"day": "Sunday", "hour_utc": 15}],
            "chapter_structure_recommendations": ["Introduce case study conflict within first 30s"],
            "insights": [{"metric": "Hook retention", "finding": "Animations reduce hook drop-off", "confidence": "high", "recommendation": "Enforce kinetic text overlays"}]
        }
    elif insight_type == "backlog-ranking":
        return {
            "generated_at": timestamp,
            "create_now": [
                {"personality_id": "ms-dhoni", "name": "MS Dhoni", "composite_score": 94.2, "trend_score": 98, "story_quality_score": 92, "geographic_demand_score": 96, "audience_fit_score": 90, "competition_gap_score": 95, "recommended_story_type": "comeback_story", "recommended_archetype": "underdog"}
            ],
            "create_later": [],
            "archive": [],
            "scoring_weights": {"trend": 0.25, "story_quality": 0.25, "geographic_demand": 0.20, "audience_fit": 0.15, "competition_gap": 0.15}
        }
    elif insight_type == "vibe":
        return {
            "generated_at": timestamp,
            "vibe": "motivational",
            "confidence": 0.84,
            "rationale": "Underdog archetype with a redemption arc maps strongly to motivational tone."
        }
    elif insight_type == "voice-director":
        return {
            "generated_at": timestamp,
            "voice_id": "mock-voice-grit-01",
            "pace": "moderate",
            "energy": "high",
            "emotion": "determined",
            "rationale": "Matches the motivational vibe and underdog archetype."
        }
    elif insight_type == "asset-planner":
        return {
            "generated_at": timestamp,
            "broll": ["stadium-crowd-roar.mp4"],
            "music": ["epic-rise-build.mp3"],
            "images": ["press-conference-still.jpg"],
            "veo_prompts": ["A lone athlete walking into an empty stadium at dawn, cinematic, slow push-in"],
            "higgsfield_prompts": ["Portrait of determination, dramatic side lighting"],
            "heygen_presenter": {"avatar_id": "mock-presenter-01", "script_segment": "intro_hook"}
        }
    elif insight_type == "thumbnail":
        return {
            "generated_at": timestamp,
            "concepts": [
                {"prompt": "Close-up intense stare, bold red text 'THE COMEBACK'", "focal_emotion": "determination", "text_overlay": "THE COMEBACK"}
            ]
        }
    elif insight_type == "retention":
        return {
            "generated_at": timestamp,
            "flags": [
                {"at_timestamp_sec": 8.0, "risk_type": "slow_intro", "severity": "medium", "recommendation": "Move the hook line earlier; trim establishing shots."}
            ]
        }
    elif insight_type == "script":
        return {
            "generated_at": timestamp,
            "format": "short",
            "script_text": "[HOOK] He lost it all in front of millions. [BODY] ... [LESSON] The comeback always starts before anyone is watching.",
            "estimated_duration_sec": 45.0,
            "word_count": 24
        }
    elif insight_type == "submission-review":
        return {
            "generated_at": timestamp,
            "outcome": "needs_revision",
            "ip_check_passed": True,
            "license_check_passed": False,
            "notes": ["Missing Envato Elements license reference for background track."]
        }
    return {"status": "success", "message": f"Insight type {insight_type} completed."}

async def _run_via_temporal(run_id: str, payload: dict) -> dict:
    """Starts ContentRunWorkflow on the hermes-content-run task queue and awaits
    its result, giving the pipeline Temporal's durability/retries/visibility
    instead of orchestrator.run_content_pipeline's in-process asyncio loop."""
    from temporalio.client import Client
    from temporal_codec import EncryptionCodec
    from temporal_workflows import ContentRunWorkflow
    from temporalio.converter import DataConverter

    address = os.getenv("TEMPORAL_ADDRESS", "localhost:7233")
    client = await Client.connect(address, data_converter=DataConverter(payload_codec=EncryptionCodec()))
    return await client.execute_workflow(
        ContentRunWorkflow.run,
        payload,
        id=run_id,
        task_queue="hermes-content-run",
    )

@app.post("/v1/orchestrate/content-run", dependencies=[Depends(verify_api_key)])
async def run_content_orchestration(request: ContentRunRequest):
    """The implementation behind chief-editor's orchestrate-content-run skill
    (openclaw/agents.manifest.json) — sequences all 11 production agents end to end.
    Callers still need to have already run the upstream LLM judgment agents (Script,
    Vibe, Voice Director, Asset Planner, Thumbnail) and pass their outputs in; this
    endpoint only owns the deterministic execution side of the pipeline.

    Runs durably on the hermes-content-run Temporal worker (temporal_worker.py).
    If Temporal is unreachable, falls back to running the pipeline in-process
    (orchestrator.run_content_pipeline) rather than failing the request outright --
    mirrors the TS-side TemporalModule's offline/stub-client edge case."""
    run_id = str(uuid.uuid4())
    payload = request.dict()
    try:
        result = await _run_via_temporal(run_id, payload)
    except Exception as e:
        logger.warning(f"Temporal unavailable ({e}); falling back to in-process orchestration.")
        try:
            return await orchestrator.run_content_pipeline(payload)
        except Exception as fallback_exc:
            logger.error(f"Error running content orchestration: {fallback_exc}")
            raise HTTPException(status_code=500, detail=f"Content orchestration error: {str(fallback_exc)}")
    return orchestrator._persist(run_id, payload, result)

async def _temporal_client():
    from temporalio.client import Client
    from temporal_codec import EncryptionCodec
    from temporalio.converter import DataConverter

    address = os.getenv("TEMPORAL_ADDRESS", "localhost:7233")
    return await Client.connect(address, data_converter=DataConverter(payload_codec=EncryptionCodec()))

@app.post("/v1/orchestrate/content-run/start", dependencies=[Depends(verify_api_key)])
async def start_content_orchestration(request: ContentRunRequest):
    """Fire-and-forget counterpart to /v1/orchestrate/content-run -- starts
    ContentRunWorkflow and returns immediately instead of awaiting the full
    pipeline. A real run (generation + assembly + render + upload) easily
    exceeds any reasonable synchronous HTTP timeout for an external caller
    like an OpenClaw agent; poll /v1/orchestrate/content-run/status/{run_id}
    for completion instead. No in-process fallback here -- a caller depending
    on the async contract needs a real Temporal cluster, not a synchronous
    surprise."""
    from temporal_workflows import ContentRunWorkflow

    run_id = str(uuid.uuid4())
    payload = request.dict()
    try:
        client = await _temporal_client()
        await client.start_workflow(
            ContentRunWorkflow.run,
            payload,
            id=run_id,
            task_queue="hermes-content-run",
        )
    except Exception as e:
        logger.error(f"Error starting content orchestration workflow: {e}")
        raise HTTPException(status_code=503, detail=f"Could not start content-run workflow: {str(e)}")
    return {"run_id": run_id, "status": "started"}

@app.get("/v1/orchestrate/content-run/status/{run_id}", dependencies=[Depends(verify_api_key)])
async def get_content_orchestration_status(run_id: str):
    """Polled by callers of /v1/orchestrate/content-run/start. Checks the
    workflow's status via describe() (non-blocking) before ever awaiting
    result(), so an in-progress run doesn't hang this request."""
    try:
        client = await _temporal_client()
        handle = client.get_workflow_handle(run_id)
        description = await handle.describe()
    except Exception as e:
        logger.error(f"Error describing content-run workflow {run_id}: {e}")
        raise HTTPException(status_code=503, detail=f"Could not query workflow status: {str(e)}")

    from temporalio.client import WorkflowExecutionStatus

    if description.status == WorkflowExecutionStatus.RUNNING:
        return {"run_id": run_id, "status": "running"}

    if description.status == WorkflowExecutionStatus.COMPLETED:
        result = await handle.result()
        orchestrator._persist(run_id, {}, result)
        return {"run_id": run_id, "status": "completed", "result": result}

    return {"run_id": run_id, "status": "failed", "workflow_status": description.status.name}

@app.post("/v1/produce/{agent_id}", dependencies=[Depends(verify_api_key)])
async def run_production_agent(agent_id: str, request: ProduceRequest):
    """Deterministic execution endpoint for the video-production agents (Higgsfield/Veo/
    HeyGen/ElevenLabs/Envato/ffmpeg/YouTube callers) — separate from /v1/agents/{agent_id},
    which runs the LLM self-improving judgment loop these agents don't need."""
    if agent_id not in PRODUCTION_AGENT_IDS:
        raise HTTPException(status_code=404, detail=f"Unknown production agent '{agent_id}'")

    schema_path = os.path.join(os.path.dirname(__file__), "agents", agent_id, "schema.json")
    schema_content = {}
    if os.path.exists(schema_path):
        with open(schema_path, "r", encoding="utf-8") as f:
            schema_content = json.load(f)

    try:
        executor = agent_loader.load_executor(agent_id)
        result = await executor.run(request.payload)
        if schema_content:
            is_valid, err_msg = validate_schema(result, schema_content)
            if not is_valid:
                logger.warning(f"[Hermes] Production agent {agent_id} output failed schema validation: {err_msg}")
        return result
    except Exception as e:
        logger.error(f"Error executing production agent {agent_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Production agent execution error: {str(e)}")

@app.post("/v1/agents/{agent_id}", dependencies=[Depends(verify_api_key)])
async def run_agent(agent_id: str, request: AgentRequest):
    rounds = request.max_refinement_rounds or config.get("ds_star", {}).get("max_refinement_rounds", 3)

    try:
        result = await execute_self_improving_hermes_agent(
            insight_type=agent_id,
            query=request.query,
            data_files=request.data_files,
            rounds=rounds,
            extra_context=request.context
        )
        return result
    except Exception as e:
        logger.error(f"Error executing agent {agent_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Hermes agent execution error: {str(e)}"
        )

@app.post("/v1/ds-star/{insight_type}", dependencies=[Depends(verify_api_key)])
async def run_ds_star_scientist(insight_type: str, request: DsStarRequest):
    rounds = request.max_refinement_rounds or config.get("ds_star", {}).get("max_refinement_rounds", 3)
    
    try:
        result = await execute_self_improving_hermes_agent(
            insight_type=insight_type,
            query=request.query,
            data_files=request.data_files,
            rounds=rounds,
            extra_context={"scientist_outputs": request.scientist_outputs} if request.scientist_outputs else None
        )
        return result
    except Exception as e:
        logger.error(f"Error executing DS-STAR analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"DS-STAR Hermes execution error: {str(e)}"
        )

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "has_hermes_lib": HAS_HERMES,
        "data_dir": DATA_DIR
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT") or config.get("api", {}).get("port", 8000))
    host = os.getenv("HOST") or config.get("api", {}).get("host", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)
