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
        
        try {
          await pool.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
          console.log('[DatabaseModule] pgvector extension verified');
        } catch (err) {
          console.warn(`[DatabaseModule] Could not load pgvector: ${err}`);
        }

        // Initialize schema for Project Atlas
        await pool.query(`
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
            embedding vector(1536),
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
        `);

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
