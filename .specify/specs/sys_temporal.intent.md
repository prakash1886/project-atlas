# Intent: Temporal Orchestration & Modal Integration (SYS-TEMPORAL)

## 1. Goals
Provide a durable state machine and task execution engine that manages long-running multi-agent swarms, recovers from rate-limits and failures, and connects to high-performance inference endpoints on Modal while ensuring absolute, zero-trust data confidentiality.

## 2. Constraints
- Zero-Trust: High-value inputs/outputs (e.g. generated designs, prompts, API targets) must never be readable in plain text within the Temporal cloud/cluster console.
- Zero credential leakage: Traceback failure details must not expose secrets.
- Serverless fallback: Failures or unavailability of external APIs must gracefully fall back to stubbed/offline operations.

## 3. Success Criteria
- Standalone Worker executes workflows by resolving activities from NestJS context.
- Workflows and payloads in the Temporal UI are completely encrypted.
- Prompt text and copy are generated via Modal's OpenAI-compatible FastAPI endpoints.
