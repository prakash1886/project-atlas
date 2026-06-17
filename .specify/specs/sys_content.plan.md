# Technical Plan: Content Factory (SYS-CONTENT)

## 1. System Architecture
```
[Agent Swarm] ➔ [S3 Object Storage] (Audio/Images)
     │
     ▼
[Postgres Metastore] ➔ [Editor Review Dashboard] ➔ [Publish Trigger]
```

## 2. Technical Decisions
- ElevenLabs API for high-fidelity voice cloning and generation.

## 3. Database & Schema Changes
```sql
CREATE TABLE IF NOT EXISTS content_assets (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(250) NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, UNDER_REVIEW, APPROVED, PUBLISHED
    script_content TEXT,
    article_content TEXT,
    voice_url VARCHAR(500),
    thumbnail_prompt TEXT,
    license_refs TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 4. File Structure & Target Files
- `[NEW]` `server/src/modules/content/content.service.ts`
- `[NEW]` `server/src/modules/content/content.controller.ts`

## 5. Verification & Test Plan
- Test S3 integration upload/download hooks.
