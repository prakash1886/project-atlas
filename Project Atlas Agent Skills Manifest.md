# **Project Atlas: Multi-Agent Systems (MAS) Skills & Tools Manifest**

This document outlines the operational profiles, programmatic tools, API bindings, and cognitive schemas for each dedicated agent in the **Project Atlas** content, intelligence, and commerce flywheel.

---

## **1. Chief Editor Agent (The Orchestrator)**

### **Operational Profile**
*   **Role:** Swarm Supervisor & Workflow Coordinator  
*   **Domain:** Stateful orchestrations, quality-control loops, Human-in-the-Loop (HITL) gates, and publication scheduling.  
*   **Primary Objective:** Direct the research, writing, design, and analytics feedback loop, ensuring quality scores exceed thresholds before human review.

### **Tool Definitions & API Bindings**
The Chief Editor requires programmatic access to the LangGraph execution runtime, state store, and the editorial review queues.

```python
def orchestrate_content_run(topic_opportunity: dict) -> dict:
    """
    Spawns and monitors the execution of Research, Fact-Check, Psychology, 
    and Story agents. Manages the iterative quality score check.
    
    Parameters:
    - topic_opportunity (dict): Output from the Trend Intelligence database.
    
    Returns:
    - dict: A structured JSON containing the completed asset bundle:
        {
          "run_id": "RUN-0XX",
          "assets": {
            "research_pack_path": str,
            "script_markdown": str,
            "blog_markdown": str,
            "thumbnail_prompt": str
          },
          "quality_report": {
            "overall_score": float,
            "fact_checks_passed": bool,
            "copyright_clean": bool
          }
        }
    """
    pass

def submit_for_editorial_review(run_id: str, assets: dict) -> bool:
    """
    Pushes generated content assets to the NestJS editorial dashboard queue, 
    suspending active workflow execution until a human editor votes PASS/REJECT.
    """
    pass
```

### **Workflow Progression Pattern**
*   Instantiates `content_assets` record in database ➔ status: `DRAFT` ➔ moves to `UNDER_REVIEW` (triggers editor notification) ➔ human approval moves status to `APPROVED` ➔ triggers publishing worker.

---

## **2. Trend Intelligence Agent (Signals Swarm)**

### **Operational Profile**
*   **Role:** Social & Search Signal Harvester  
*   **Domain:** API rate throttling, pattern recognition, and trend opportunity scoring.  
*   **Primary Objective:** Continuous ingestion of global search and discussion volume, scoring topics to feed the content queue.

### **Tool Definitions & API Bindings**
The Trend Agent interacts with external search, discussion, and view metrics using Redis rate-limited proxy systems.

```python
def fetch_signals(source: str, query: str) -> list:
    """
    Queries Google Trends, Reddit API, or YouTube search to retrieve raw volume 
    and velocity statistics.
    
    Returns:
    - list: Raw metric signals mapped by datetime.
    """
    pass

def calculate_opportunity_score(raw_metrics: dict) -> dict:
    """
    Executes the Project Atlas weighted opportunity formula:
    Score = Search(20%) + Discussion(15%) + Video(15%) + Evergreen(15%) 
            + Emotional(10%) + Competition(10%) + Monetization(10%) + Regional(5%)
            
    Returns:
    - dict: {"topic": str, "final_score": int, "classification": str}
    """
    pass
```

---

## **3. Knowledge Graph Agent (Memory Swarm)**

### **Operational Profile**
*   **Role:** Semantic Memory database Curator  
*   **Domain:** Vector similarity metrics, entity relationship models, and contextual injection.  
*   **Primary Objective:** Maintain and explore the PostgreSQL `entities` and `relationships` tables to feed deep relational facts to active writing agents.

### **Tool Definitions & SQL Bindings**

```python
def query_semantic_nodes(query_text: str, limit: int = 5) -> list:
    """
    Converts query text to a 1536-dimension embedding and runs a cosine distance 
    query in PostgreSQL using pgvector to find related nodes.
    
    SQL Query Run:
    SELECT name, type, summary, (embedding <=> $1) as distance 
    FROM entities ORDER BY distance LIMIT $2;
    """
    pass

def autolink_entities(entity_id: str) -> list:
    """
    Scans the summary and metadata of an entity and cross-references the graph 
    to automatically suggest new edge relationships (e.g. FACED, INFLUENCED_BY).
    """
    pass
```

---

## **4. Research & Fact-Check Swarm**

### **Operational Profile**
*   **Role:** Information Harvester & Factual Auditor  
*   **Domain:** Web scraping, citation cataloging, and logical validation.  
*   **Primary Objective:** Build a bulletproof factual dossier for the writing swarm and flag all unverified claims or dates.

### **Tool Definitions & API Bindings**

```python
def gather_citations(topic: str) -> dict:
    """
    Queries Wikipedia, News RSS, and public databases. Synthesizes facts 
    and associates each with a verified source link.
    """
    pass

def verify_claims(draft_text: str) -> dict:
    """
    Cross-references draft script claims against verified fact databases.
    Identifies numerical, date, or relational contradictions.
    
    Returns:
    - dict: {
        "verified_claims_count": int,
        "flagged_contradictions": [
            {"claim": str, "contradiction": str, "severity": "HIGH"|"LOW"}
        ],
        "pass_validation": bool
      }
    """
    pass
```

---

## **5. Narrative & Psychology Swarm**

### **Operational Profile**
*   **Role:** Audience Engagement & Scriptwriting Engineer  
*   **Domain:** Narrative hooks, emotional pacing, cognitive bias framing, and scripting.  
*   **Primary Objective:** Draft documentary scripts and articles that hold attention by analyzing the emotional and psychological drivers of subjects.

### **Tool Definitions & Python Bindings**

```python
def generate_psych_profile(subject_entity: str) -> dict:
    """
    Extracts the core motivations, decisions under pressure, biases, 
    and mental models of a historical figure or topic subject.
    """
    pass

def draft_video_script(factual_dossier: dict, psych_profile: dict, duration_minutes: int) -> dict:
    """
    Applies three-act structural scripting to draft the complete narration, 
    including opening hooks, visual cues, and chapter divisions.
    """
    pass
```

---

## **6. Commerce & Design Agent**

### **Operational Profile**
*   **Role:** CMF Designer & Merch Matching Engine  
*   **Domain:** Midjourney/Flux prompt scripting, Print-on-Demand templates, and trademark auditing.  
*   **Primary Objective:** Convert video topics into ready-to-sell physical and digital merchandise designs without violating IP.

### **Tool Definitions & API Bindings**

```python
def generate_design_prompt(topic: str, product_type: str) -> str:
    """
    Translates the central themes of an approved script into minimal, premium 
    design prompts suitable for Flux or DALL-E image generation.
    """
    pass

def audit_trademark_compliance(design_text: str) -> dict:
    """
    Queries public trademark database APIs to ensure the generated design text 
    or quote does not violate registered intellectual property.
    """
    pass
```

---

## **7. Data Science & Learning Agent (DS-STAR)**

### **Operational Profile**
*   **Role:** Flywheel Optimizer & Performance Forecaster  
*   **Domain:** Linear regression, retention modeling, and hyperparameter tuning.  
*   **Primary Objective:** Sync YouTube performance statistics daily to dynamically tune opportunity scoring weights and writing prompt styles.

### **Tool Definitions & Python Bindings**

```python
def forecast_retention(video_id: str) -> dict:
    """
    Parses retention curve coordinates from YouTube analytics to predict 
    audience drop-off hotspots.
    """
    pass

def optimize_scoring_weights(actual_vs_predicted: list) -> dict:
    """
    Performs gradient adjustments on the Trend Engine scoring weights to align 
    suggested opportunities with actual views and retention growth.
    """
    pass
```

---

## **8. Collaborative Data Exchange Schema (JSON Core)**

All Project Atlas swarms pass transactional states using a standardized JSON payload structure over the NestJS event bus or LangGraph state:

```json
{
  "run_metadata": {
    "run_id": "RUN-089",
    "topic": "Tendulkar vs McGrath",
    "associated_opportunity_id": 104,
    "timestamp": "2026-06-17T19:50:00Z"
  },
  "dossier": {
    "research_pack_url": "s3://atlas-bucket/runs/089/research.pdf",
    "citations_count": 28,
    "psych_profile": {
      "focus": "Resilience and pressure focus",
      "biases": ["Confirmation bias", "Survivor bias"]
    }
  },
  "generated_assets": {
    "script_url": "s3://atlas-bucket/runs/089/script.md",
    "narration_audio_url": "s3://atlas-bucket/runs/089/narration.mp3",
    "thumbnail_image_url": "s3://atlas-bucket/runs/089/thumbnail.png",
    "merch_prompts": [
      {
        "product": "t-shirt",
        "flux_prompt": "Minimalist graphic vector design representing dual cricketers..."
      }
    ]
  },
  "compliance_status": {
    "fact_check_score": 98.4,
    "trademark_pass": true,
    "copyright_license_references": ["ENV-9023", "ENV-8841"],
    "workflow_status": "UNDER_REVIEW"
  }
}
```
