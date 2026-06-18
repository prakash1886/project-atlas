# Feature Specification: Temporal Orchestration & Modal Integration (SYS-TEMPORAL)

## 1. Overview & Goal
Enforces reliable orchestration and execution of the multi-agent trend-based ad generation pipeline.

## 2. User Stories
- **As a Developer / DevOps Engineer**: I want the workflow orchestration to run securely on a zero-trust network so that sensitive data (e.g. prompt variables, customer-facing content) remains encrypted at rest and in transit.

## 3. Functional Requirements
- **Stateful Orchestration**: Temporal.io coordinates trend signals scanning, asset generation, print-on-demand variant templates, and Shopify storefront publishing. (F-001)
- **NestJS Integration**: Provide a secure Client through NestJS module architecture. (F-002)
- **Durable Worker execution**: Run a background worker that executes the NestJS context to handle activity implementations. (F-003)
- **Zero-Trust Encryption**: Payload codecs encrypt/decrypt inputs/outputs using AES-256-GCM. (F-004)
- **Failure Obfuscation**: Enforce encryption of messages and stack traces for all failing activities and workflows. (F-005)
- **Modal GPU Inference**: Delegate language/image model runs to specialized serverless Gemma models on Modal. (F-006, F-007)

## 4. Edge Cases
- **Temporal Cluster Unreachable**: System defaults to offline mock client so NestJS bootstraps correctly without blocking development startup.
- **Modal API Rate Limits**: Worker retries activity execution automatically using exponential backoff provided by Temporal's scheduler.

## 5. Acceptance Criteria
- Complete execution of compilation and lint checks.
- Workflow payloads and failure attributes are encrypted in the Temporal Web UI.
