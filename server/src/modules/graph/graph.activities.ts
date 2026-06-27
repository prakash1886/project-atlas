import { Injectable } from '@nestjs/common';
import { GraphService, type SemanticNode, type SuggestedEdge } from './graph.service.js';

/** Temporal activity wrappers for the knowledge-graph task queue (query-semantic-nodes, autolink-entities skills). */
@Injectable()
export class GraphActivities {
  constructor(private readonly graph: GraphService) {}

  async querySemanticNodes(query_text: string, limit?: number): Promise<SemanticNode[]> {
    return this.graph.querySemanticNodes(query_text, limit);
  }

  async autolinkEntities(entity_id: string): Promise<SuggestedEdge[]> {
    return this.graph.autolinkEntities(entity_id);
  }
}
