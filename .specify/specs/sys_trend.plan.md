# Technical Plan: Trend Intelligence (SYS-TREND)

## 1. System Architecture
```
[External Sources] ➔ [Signal Poller (NestJS Cron)] ➔ [Opportunity Engine] ➔ [PostgreSQL]
```

## 2. Technical Decisions
- Use Redis to coordinate rate limits across multiple instances.

## 3. Database & Schema Changes
```sql
CREATE TABLE IF NOT EXISTS raw_signals (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL,
    topic VARCHAR(250) NOT NULL,
    metrics JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_opportunities (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(250) UNIQUE NOT NULL,
    trend_score INTEGER NOT NULL,
    metadata JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 4. File Structure & Target Files
- `[NEW]` `server/src/modules/trend/trend.service.ts`
- `[NEW]` `server/src/modules/trend/trend.controller.ts`

## 5. Verification & Test Plan
- Run `npm run test:trend` to verify opportunity weight calculations.
