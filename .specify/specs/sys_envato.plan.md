# Technical Plan: Envato API & MCP Integration (SYS-ENVATO)

## 1. System Architecture
```
 [ Swarm Agent / Assistant ] 
      │
      ├── (Searches via MCP) ──> [ Envato Creative Companion (mcp.envato.com/mcp) ]
      │
      └── (Licenses via API) ──> [ Envato API Service (NestJS) ] ──> [ build.envato.com/api ]
```

## 2. Technical Decisions
- Use the Envato Creative Companion MCP Server URL (`https://mcp.envato.com/mcp`) for LLM agent integration.
- Utilize the Envato Market API v3 (`https://api.envato.com`) for programmatic license verification and download links.

## 3. Database & Schema Changes
Updates to existing `content_assets` table or metadata records to link Envato asset IDs:
```sql
ALTER TABLE content_assets 
ADD COLUMN IF NOT EXISTS envato_item_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS envato_license_key VARCHAR(100),
ADD COLUMN IF NOT EXISTS envato_licensing_date TIMESTAMP WITH TIME ZONE;
```

## 4. File Structure
- `[NEW]` [envato.module.ts](file:///d:/Project%20Atlas/server/src/modules/envato/envato.module.ts)
- `[NEW]` [envato.service.ts](file:///d:/Project%20Atlas/server/src/modules/envato/envato.service.ts)

## 5. Verification & Test Plan
- Run curl/postman requests to `https://api.envato.com/v3/market/buyer/purchases` using mock sandbox credentials to test response parsers.
