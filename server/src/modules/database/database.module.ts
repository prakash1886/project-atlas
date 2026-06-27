import { Module, Global } from '@nestjs/common';
import pg from 'pg';
import { newDb } from 'pg-mem';

const { Pool } = pg;

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: async () => {
        let pool: pg.Pool;
        const databaseUrl = process.env.DATABASE_URL;

        if (databaseUrl) {
          console.log('[DatabaseModule] Live PostgreSQL detected.');
          pool = new Pool({
            connectionString: databaseUrl,
            ssl: databaseUrl.includes('sslmode=disable') ? false : { rejectUnauthorized: false }, // nosemgrep
          });
        } else {
          console.log('[DatabaseModule] Falling back to local in-memory pg-mem...');
          const db = newDb();
          const { Pool: PgMemPool } = db.adapters.createPg();
          pool = new PgMemPool();
        }
        
        let hasTimescale = false;
        try {
          await pool.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
          console.log('[DatabaseModule] pgvector extension verified');
        } catch (err) {
          console.warn(`[DatabaseModule] Could not load pgvector: ${err}`);
        }

        try {
          await pool.query(`CREATE EXTENSION IF NOT EXISTS timescaledb;`);
          console.log('[DatabaseModule] timescaledb extension verified');
          hasTimescale = true;
        } catch (err) {
          console.warn(`[DatabaseModule] Could not load timescaledb (falling back to standard SQL tables): ${err}`);
        }

        // Initialize schema for Project Atlas
        let initSql = `
          CREATE TABLE IF NOT EXISTS content_opportunities (
            id SERIAL PRIMARY KEY,
            topic VARCHAR(250) UNIQUE NOT NULL,
            trend_score INTEGER NOT NULL,
            metadata JSONB NOT NULL,
            status VARCHAR(20) DEFAULT 'PENDING',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS entities (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(250) NOT NULL,
            type VARCHAR(50) NOT NULL,
            summary TEXT,
            embedding vector(300),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS relationships (
            id SERIAL PRIMARY KEY,
            source_id VARCHAR(100) REFERENCES entities(id) ON DELETE CASCADE,
            target_id VARCHAR(100) REFERENCES entities(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL,
            weight NUMERIC(3,2) DEFAULT 1.00,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(source_id, target_id, type)
          );

          CREATE TABLE IF NOT EXISTS video_analytics (
            time TIMESTAMP WITH TIME ZONE NOT NULL,
            video_id VARCHAR(50) NOT NULL,
            views INTEGER NOT NULL DEFAULT 0,
            ctr NUMERIC(4,2) DEFAULT 0.00,
            watch_time_seconds INTEGER DEFAULT 0,
            average_retention NUMERIC(4,2) DEFAULT 0.00,
            PRIMARY KEY (time, video_id)
          );

          -- SIGNALS-ONLY (SYS-POLICY F-003): stores a derived numeric signal, never provider result
          -- bodies, so it is compliant on Brave's non-storage-rights $5 plan.
          CREATE TABLE IF NOT EXISTS search_cache (
            source VARCHAR(16) NOT NULL,
            query TEXT NOT NULL,
            metric VARCHAR(32) NOT NULL,
            value NUMERIC NOT NULL,
            fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (source, query)
          );

          -- Per-call cost ledger backing the zero-overage monthly cap (SYS-POLICY F-007/F-008).
          CREATE TABLE IF NOT EXISTS api_usage_ledger (
            id SERIAL PRIMARY KEY,
            provider VARCHAR(16) NOT NULL,
            endpoint VARCHAR(32) NOT NULL,
            request_count INTEGER NOT NULL DEFAULT 1,
            est_cost_usd NUMERIC(10,5) NOT NULL DEFAULT 0,
            day DATE NOT NULL DEFAULT CURRENT_DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS envato_asset_references (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            designer_task_id UUID,
            video_id UUID,
            envato_item_id VARCHAR(255) NOT NULL,
            item_type VARCHAR(50) NOT NULL,
            license_type VARCHAR(100) DEFAULT 'Elements Single-Use',
            usage_role VARCHAR(50) NOT NULL,
            incorporated_description TEXT,
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS video_production_metrics (
            video_id UUID PRIMARY KEY,
            visual_tempo_seconds INT,
            transition_style VARCHAR(50),
            music_prompt_used TEXT,
            audio_ducking_db INT,
            sfx_count INT,
            average_view_duration_percent DECIMAL,
            ctr_percent DECIMAL
          );

          -- P2 editorial review HITL gate (sys_content.plan.md). temporal_workflow_id is the
          -- editorialReviewWorkflow instance the /api/reviews/:id/vote endpoint signals.
          CREATE TABLE IF NOT EXISTS content_assets (
            id SERIAL PRIMARY KEY,
            topic VARCHAR(250) NOT NULL,
            status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, UNDER_REVIEW, APPROVED, REJECTED
            script_content TEXT,
            article_content TEXT,
            voice_url VARCHAR(500),
            thumbnail_prompt TEXT,
            license_refs TEXT[],
            temporal_workflow_id VARCHAR(255),
            review_notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `;

        if (!databaseUrl) {
          // pg-mem does not support pgvector, rewrite type to text
          initSql = initSql.replace(/vector\(300\)/g, 'text');
        }

        await pool.query(initSql);

        // CREATE TABLE IF NOT EXISTS doesn't retroactively fix a column type on an already-deployed
        // table -- the live entities.embedding column was vector(1536) until this fix; both existing
        // rows have a NULL embedding (never populated), so this migration is safe to run unconditionally.
        if (databaseUrl) {
          try {
            await pool.query(`ALTER TABLE entities ALTER COLUMN embedding TYPE vector(300);`);
            console.log('[DatabaseModule] entities.embedding migrated to vector(300)');
          } catch (err) {
            console.warn(`[DatabaseModule] Could not migrate entities.embedding to vector(300): ${err}`);
          }
        }

        // Convert video_analytics to a TimescaleDB hypertable if the extension is available
        if (hasTimescale) {
          try {
            await pool.query(`SELECT create_hypertable('video_analytics', 'time', if_not_exists => TRUE);`);
            console.log('[DatabaseModule] video_analytics converted to TimescaleDB hypertable');
          } catch (err) {
            console.warn(`[DatabaseModule] Failed to convert video_analytics to hypertable: ${err}`);
          }
        }

        // Seed Mock Data
        const opportunitiesCount = await pool.query(`SELECT COUNT(*) FROM content_opportunities;`);
        if (parseInt(opportunitiesCount.rows[0].count) === 0) {
          console.log('[DatabaseModule] Seeding mock opportunities and graph nodes...');
          await pool.query(`
            INSERT INTO content_opportunities (topic, trend_score, metadata, status)
            VALUES 
              ('Tendulkar vs McGrath', 94, '{" evergreen": true, "niche": "cricket"}', 'PENDING'),
              ('Stoicism and Resilience', 89, '{"evergreen": true, "niche": "philosophy"}', 'APPROVED');

            INSERT INTO entities (id, name, type, summary)
            VALUES
              ('sachin', 'Sachin Tendulkar', 'PERSON', 'Legendary Indian batsman.'),
              ('mcgrath', 'Glenn McGrath', 'PERSON', 'Legendary Australian fast bowler.');

            INSERT INTO relationships (source_id, target_id, type, weight)
            VALUES
              ('sachin', 'mcgrath', 'FACED', 0.95);
          `);
        }
        
        console.log('[DatabaseModule] Project Atlas schema verified');
        return pool;
      },
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DatabaseModule {}
