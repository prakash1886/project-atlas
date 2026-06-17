# Feature Specification: UI/UX & Portal Screens (SYS-UI)

## 1. Overview & Goal
Provides a unified, high-density React portal to coordinate the Project Atlas trend discovery, memory graphs, research folders, content pipeline, and performance analytics.

---

## 2. Design Tokens & Styles

- **Theme**: Dark mode by default (`zinc-950` base, `zinc-900` cards, `border-zinc-800`).
- **Accent**: Electric Blue-to-Violet gradients (`from-blue-400 to-violet-500`) for headers, status badges, and active selections.
- **Typography**: 
  - **Outfit** for clean headings and UI text.
  - **JetBrains Mono** for serial tokens, cost metrics, and code references.

---

## 3. Screen Specifications (5 MVP Screens)

### A. Dashboard (`/dashboard`)
*   *Trending Topics*: Cards showing topic name, tags, and sparkline charts.
*   *Opportunity Scores*: Colored badges based on scores (Red: low, Amber: medium, Green: >80). (F-001)
*   *Production Queue*: High-density status table (DRAFT, UNDER_REVIEW, APPROVED, PUBLISHED). (F-002)

### B. Knowledge Graph Explorer (`/graph`)
*   *Force-Directed Canvas*: Renders interactive entity nodes (colored by type) and typed relationship lines. (F-003)
*   *Inspection Drawer*: Side-out panel displaying node summaries, connections, and AI auto-link suggestions. (F-004)

### C. Research Workspace (`/research`)
*   *Dossier Viewer*: Displays gathered facts and citations linked to sources. (F-005)
*   *Audit Panel*: Displays warning alerts for factual contradictions or claims that failed verification. (F-006)

### D. Content Factory (`/factory`)
*   *Script Editor*: Narrator script pane aligned with visual cues and asset directions. (F-007)
*   *Asset Preview*: Integrated voice preview player (ElevenLabs) and thumbnail showcase. (F-008)
*   *HITL Curation & Publish*: Workflow approval buttons; allows publishing only after editor approval. (F-009)

### E. Analytics Dashboard (`/analytics`)
*   *Retention Hotspots*: Plots daily views, CTR, and watch time retention curves. (F-010)
*   *Hyperparameter Tuning*: Logs weight modifications made by the DS-STAR learning loop. (F-011)

---

## 4. Edge Cases
- **Slow Audio Load**: Pre-allocated URLs are cached to prevent player stagnation.
- **Graph Node Overload**: Canvas aggregates to community clusters if nodes exceed 5,000.
- **Save State Disconnections**: Local state cached via Zustand to avoid data loss.
