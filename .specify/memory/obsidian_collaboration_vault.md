# Agent Memory Layer: Obsidian Collaboration Vault Design

This document specifies how Project Atlas uses an **Obsidian Vault** structure to implement Working, Episodic, and Semantic memory layers for cross-agent collaboration and state management.

---

## 1. Memory Layer Mapping

By utilizing a structured folder vault, we map the three memory layers into standard, human-readable, and machine-indexable Markdown files:

| Memory Layer | Storage Substrate | Obsidian Vault Implementation | Agent Interaction Pattern |
| :--- | :--- | :--- | :--- |
| **Working Memory** | Active Orchestration State | `03_Working_State/Active_Run_State.md` | The Orchestrator writes the active topic, current sub-swarm step, and queue variables here. Other agents read this file to determine their active context. |
| **Episodic Memory** | Ledger of Execution Logs | `02_Episodic_Ledger/Run_0XX_Report.md` | Agents append structured markdown files containing YAML frontmatter (`Timestamp`, `Iteration_ID`, `Parameters`, `Status`, `Errors`) after every tool execution run. |
| **Semantic Memory** | Relational Knowledge Base | `01_Semantic_Base/[[Wiki_Links]]` | Holds global taxonomy rules, system theories, and entity nodes. Agents resolve relationships and query documentation via Obsidian wikilinks. |

---

## 2. Vault Directory Structure

The vault is initialized under the root directory `.specify/vault/` with the following structure:

```
.specify/vault/
  ├── 01_Semantic_Base/                # Semantic Memory (Knowledge Base)
  │    ├── Global_System_Theory.md     # General opportunity weights & formulas
  │    ├── Content_Taxonomy.md         # Content categories (Sports, Philosophy...)
  │    └── Entities/                   # Individual notes representing graph nodes
  │         ├── Sachin_Tendulkar.md
  │         └── Glenn_McGrath.md       # Linked to Sachin via [[Sachin_Tendulkar]]
  ├── 02_Episodic_Ledger/              # Episodic Memory (Audit Trail / Logs)
  │    ├── Run_001_Report.md
  │    └── Run_002_Report.md           # Markdown files with YAML frontmatter logs
  └── 03_Working_State/                # Working Memory (Active Execution state)
       └── Active_Run_State.md         # Current active topic, step, and budgets
```

---

## 3. Implementation of the Memory Layers

### A. Working Memory (`03_Working_State/Active_Run_State.md`)
Representing the volatile state of the current swarm execution run.

```markdown
---
active_run_id: RUN-089
associated_opportunity_id: 104
target_topic: "Tendulkar vs McGrath"
current_step: "RESEARCH_DEBATE"
active_swarm: "Debate & Verification Swarm"
budget_limit_usd: 1.50
cumulative_cost_usd: 0.1240
---

# Active Swarm Working Memory
- **Current Objective**: Debate Sachin's performance against McGrath's outside-the-off-stump line in the 1999 Adelaide Test.
- **Active Thread Context**: 
  - `Pro_Agent` drafted argument about McGrath's psychological dominance.
  - `Contra_Agent` responding with Sachin's 1999 batting adjustments.
```

### B. Episodic Memory (`02_Episodic_Ledger/Run_0XX_Report.md`)
Appended after every major execution cycle to maintain a historical database of operations.

```markdown
---
timestamp: 2026-06-17T19:50:00Z
run_id: RUN-089
iteration_id: ITER-04
agent: "Fact Checker Agent"
status: "COMPLETED"
error_logs: "None"
parameters:
  assertions_checked: 12
  failures_found: 1
---

# Episodic Execution Log
- **Task**: Audit draft narrative for chronological errors.
- **Action**: Validated Adelaide Test date (asserted: Dec 1999, actual: Dec 1999 - Match).
- **Flagged Items**: Corrected the assertion that McGrath bowled 6 consecutive maidens to Sachin in the first innings; actual records show 4. (F-003)
```

### C. Semantic Memory (`01_Semantic_Base/`)
Using Markdown cross-linking to create a native, visual knowledge graph.

```markdown
# Entity: Glenn McGrath

- **Type**: Person
- **Niche**: [[Cricket]]
- **Attributes**: Fast Bowler, Australian Cricket Team.

## Relationships
- Faced [[Sachin_Tendulkar]] in key Test matches.
- In his autobiography, he discussed [[Stoicism_and_Resilience]] as a core training tool.
```

---

## 4. Why this matches QMD & Graphify
1.  **QMD Local Indexing**: QMD indexes the entire `.specify/vault/` folder. Agents can run semantic vector searches locally (`qmd query "clay evaporation"`) to query the Semantic Base in milliseconds.
2.  **Graphify Structural Resolution**: Because Obsidian notes are linked via `[[Wikilinks]]`, Graphify parses these markdown link relationships programmatically (treating them as edges) and renders them in `graph.json` and `graph.html`.
