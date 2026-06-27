import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Pool } from 'pg';
import { LlmService } from '../llm/llm.service.js';

/** Human Story Graph node (entities table), matching query-semantic-nodes/autolink-entities skill contracts. */
export interface SemanticNode {
  name: string;
  type: string;
  summary: string;
  distance: number;
}

export interface SuggestedEdge {
  from: string;
  type: string;
  to: string;
  confidence: number;
}

const RELATIONSHIP_TYPES = ['INSPIRED', 'RIVALED', 'FAILED', 'REINVENTED', 'LED', 'MENTORED', 'INFLUENCED', 'ACQUIRED'];

/**
 * Human Story Graph backend (SYS-GRAPH): query-semantic-nodes + autolink-entities skills.
 * Implemented as plain Postgres tables (entities/relationships) + pgvector, not Apache AGE --
 * the spec (sys_graph.spec.md) only requires node/edge CRUD + vector lookup + edge suggestion,
 * which this schema already satisfies.
 */
@Injectable()
export class GraphService {
  private readonly logger = new Logger(GraphService.name);

  constructor(
    @Inject('DATABASE_POOL') private readonly db: Pool,
    private readonly llm: LlmService
  ) {}

  /** Embeds and upserts an entity. Without this, `entities` never grows past its two seed rows. */
  async upsertEntity(id: string, name: string, type: string, summary: string): Promise<void> {
    const [embedding] = await this.llm.generateEmbeddings([summary]);
    await this.db.query(
      `INSERT INTO entities (id, name, type, summary, embedding)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET name = $2, type = $3, summary = $4, embedding = $5`,
      [id, name, type, summary, JSON.stringify(embedding)]
    );
    this.logger.log(`[upsertEntity] ${id} (${type})`);
  }

  /** query-semantic-nodes skill: cosine-distance search over the entities table (manifest §3 SQL). */
  async querySemanticNodes(query_text: string, limit: number = 5): Promise<SemanticNode[]> {
    const [embedding] = await this.llm.generateEmbeddings([query_text]);
    const result = await this.db.query(
      `SELECT name, type, summary, (embedding <=> $1) AS distance
       FROM entities ORDER BY distance LIMIT $2`,
      [JSON.stringify(embedding), limit]
    );
    this.logger.log(`[querySemanticNodes] "${query_text}" -> ${result.rows.length} nodes`);
    return result.rows;
  }

  /**
   * autolink-entities skill: propose new edges for entity_id, restricted to the skill's own
   * relationship vocabulary. Returns suggestions only -- never writes to `relationships` itself,
   * matching the skill's documented "human/Curator approves before persisting" rule.
   */
  async autolinkEntities(entity_id: string): Promise<SuggestedEdge[]> {
    const entityResult = await this.db.query(`SELECT id, name, type, summary FROM entities WHERE id = $1`, [entity_id]);
    const entity = entityResult.rows[0];
    if (!entity) {
      this.logger.warn(`[autolinkEntities] unknown entity_id: ${entity_id}`);
      return [];
    }

    const existingEdges = await this.db.query(
      `SELECT source_id, type, target_id FROM relationships WHERE source_id = $1 OR target_id = $1`,
      [entity_id]
    );
    const candidates = await this.querySemanticNodes(entity.summary, 10);

    const prompt = `Entity: ${entity.name} (${entity.type}) -- ${entity.summary}
Existing relationships: ${JSON.stringify(existingEdges.rows)}
Candidate related entities: ${JSON.stringify(candidates.filter((c) => c.name !== entity.name))}

Propose new typed edges from this entity to candidates, using ONLY these relationship types:
${RELATIONSHIP_TYPES.join(', ')}.
Return schema-only JSON: a list of {"from": "${entity_id}", "type": "<TYPE>", "to": "<candidate entity name>", "confidence": <0-1>}.`;

    const raw = await this.llm.generateText(prompt, 'You are the Knowledge Graph autolink-entities agent. Output JSON only.');
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      this.logger.warn(`[autolinkEntities] non-JSON model output for ${entity_id}, returning no suggestions`);
      return [];
    }
  }
}
