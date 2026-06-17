# Technical Plan: Analytics & Learning Loop (SYS-ANALYTICS)

## 1. System Architecture
```
[YouTube API] ➔ [Analytics Ingester] ➔ [PostgreSQL] ➔ [Learning Feedback Loop]
                                                              │
                                                              ▼
                                                   [Opportunity Weights]
```

## 2. Technical Decisions
- Ingest stats using Daily NestJS background cron job.

## 3. Database & Schema Changes
```sql
CREATE TABLE IF NOT EXISTS video_analytics (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(50) UNIQUE NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    ctr NUMERIC(4,2) DEFAULT 0.00,
    watch_time_seconds INTEGER DEFAULT 0,
    average_retention NUMERIC(4,2) DEFAULT 0.00,
    polled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 4. File Structure & Target Files
- `[NEW]` `server/src/modules/analytics/analytics.service.ts`
- `[NEW]` `server/src/modules/analytics/analytics.controller.ts`

## 5. Verification & Test Plan
- Verify that simulated high-performing videos increase corresponding genre weights.
