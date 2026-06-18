# Technical Plan: Temporal Orchestration & Modal Integration (SYS-TEMPORAL)

## 1. System Architecture
```
  [ NestJS Client ]
         │ (workflow trigger)
         ▼
  [ Temporal Cluster ] (State Orchestrator)
         │ (polls queues)
         ▼
  [ Standalone Worker ] (NestJS context)
         │
         ├──[ scanTrends Activity ]
         ├──[ generateAdContent Activity ] ──> [ Modal serverless Gemma GPU ]
         ├──[ registerPrintOnDemand Activity ]
         └──[ publishToShopify Activity ]
```

## 2. Technical Decisions
- Temporal TypeScript SDK for orchestrating background workflows and activities.
- Native Node.js `crypto` with `aes-256-gcm` for `PayloadCodec` custom encryption.
- `DefaultFailureConverter` configured with `{ encodeCommonAttributes: true }` to encrypt standard failure fields.
- `openai` SDK to interact with Modal serverless endpoints using OpenAI-compatible FastAPI.

## 3. Database & Schema Changes
No SQL database migrations required. All persistence is managed by the Temporal cluster internally or through existing application state databases.

## 4. File Structure
- `[NEW]` [encryption-codec.ts](file:///d:/Project%20Atlas/server/src/modules/temporal/crypto/encryption-codec.ts)
- `[NEW]` [temporal.module.ts](file:///d:/Project%20Atlas/server/src/modules/temporal/temporal.module.ts)
- `[NEW]` [llm.module.ts](file:///d:/Project%20Atlas/server/src/modules/llm/llm.module.ts)
- `[NEW]` [llm.service.ts](file:///d:/Project%20Atlas/server/src/modules/llm/llm.service.ts)
- `[NEW]` [ad-automation.workflow.ts](file:///d:/Project%20Atlas/server/src/modules/temporal/workflows/ad-automation.workflow.ts)
- `[NEW]` [ad-automation.activities.ts](file:///d:/Project%20Atlas/server/src/modules/temporal/activities/ad-automation.activities.ts)
- `[NEW]` [worker.ts](file:///d:/Project%20Atlas/server/src/worker.ts)

## 5. Verification Plan
- Build checklist command: `npm run build`
- Linter verification: `npm run lint`
- Worker dev task queue polling: `npm run worker:dev`
