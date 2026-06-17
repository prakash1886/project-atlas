# Project Constitution: Project Atlas

This constitution defines the immutable technical principles, architectural patterns, coding standards, and process guidelines for Project Atlas. Every AI agent and developer working on this codebase must strictly adhere to these rules.

---

## 1. Core Architecture & Tech Stack

1. **Frontend Core**: React 18+ with TypeScript, Vite, ShadCN UI, TailwindCSS, Zustand for state management, and ECharts for analytics/graph visualizations.
2. **Backend Core**: NestJS modular monolith/microservices with REST and GraphQL APIs. Redis and BullMQ for background queue management.
3. **AI & Agent Runtime**: LangGraph for stateful agent orchestration. Core LLMs include OpenAI, Claude, and Gemini. Programmatic generation uses Flux/GPT Image (thumbnails), ElevenLabs (voice), and Remotion + FFmpeg (video assembly).
4. **Database & Storage**: PostgreSQL with `pgvector` for semantic vector embeddings and similarity queries. S3-compatible storage for generated multimedia assets.
5. **Testing Stack**:
   - **Unit & Integration**: Vitest with `@testing-library/react` and MSW (Mock Service Worker).
   - **Visual & Component**: Storybook JS with accessibility audits (`addon-a11y`).
   - **E2E Integration**: Playwright.
   - **Database Mocks**: `pg-mem` for in-memory repository tests.
6. **Observability**: OpenTelemetry standard tracers, structured JSON logging (`pino`), Prometheus metrics (`prom-client`), and exception tracking.

---

## 2. Fact-Spec Driven Development (F-SDD) Rules

To prevent architectural drift and verify feature completeness, all development must follow the F-SDD lifecycle:

1. **No Spec, No Code**: Do not create or edit source code files without an approved Feature Spec and Technical Plan under `.specify/specs/`.
2. **Atomic Facts**: All functional requirements and technical constraints must be written as flat, single-assertion statements in `.specify/specs/<feature>.facts`.
3. **Traceability**: All tasks in implementation checklists (`task.md` or issues) must end with the ID of the fact they satisfy (e.g., `(F-001)`).
4. **Verification**: After coding, the agent must verify that all facts have been implemented and validated, changing the tag of the fact from `@spec` or `@draft` to `@verified`.

---

## 3. Coding Standards & Guidelines

1. **TypeScript Integrity**:
   - Set `"strict": true` in `tsconfig.json`.
   - Avoid `any` type assertions. Use precise type definitions or generics.
   - Prefer interfaces for domain models and types for unions/actions.
2. **UI & Component Design**:
   - All interactive UI elements must be responsive and accessible (compliant with WCAG 2.1 AA, audited via Storybook `addon-a11y`).
   - Every component must have a corresponding Storybook `.stories.tsx` file capturing its default state, hover state, error state, and interactive play scenarios.
3. **Clean Code & Comments**:
   - Keep functions small, focused, and single-purpose.
   - Preserve all existing comments and docstrings unless explicitly refactoring that code block.
   - Code symbols (classes, functions, types) must be documented inline.

---

## 4. Agent Memory & Local Search Architecture

To ensure zero-token search latency and cross-agent coordination in production, the platform utilizes a file-based Markdown database (Obsidian Vault structure) backed by local vector and graph indexing engines:

1. **Obsidian Vault substrate**:
   - **Working Memory**: Located at `03_Working_State/Active_Run_State.md` to coordinate current topics, tasks, and budgets.
   - **Episodic Memory**: Located at `02_Episodic_Ledger/Run_0XX_Report.md` to log metadata (timestamps, variables, status, errors) after every swarm execution.
   - **Semantic Memory**: Located at `01_Semantic_Base/` using `[[Wiki_Links]]` to define relationships between entities.
2. **QMD (Quick Markdown Search)**:
   - Exposes local vector and keyword query endpoints (hybrid search) for agents to query documentation, theories, and historical logs in milliseconds.
3. **Graphify**:
   - Compiles Markdown link paths to build the live relational database model (`graph.json`), allowing agents to run pathfinding queries to determine how entities connect.
4. **Development and Production Alignment**:
   - *Coding Agents* use QMD & Graphify to query specifications and code the platform.
   - *Production Swarms* use QMD & Graphify to execute semantic searches and link facts within their own knowledge base.
