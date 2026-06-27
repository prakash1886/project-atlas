import { proxyActivities } from '@temporalio/workflow';
import type { GraphActivities } from '../../graph/graph.activities.js';
import type { SemanticNode, SuggestedEdge } from '../../graph/graph.service.js';

const { querySemanticNodes, autolinkEntities } = proxyActivities<GraphActivities>({
  taskQueue: 'knowledge-graph',
  // Each call embeds via the Modal GPU endpoint + a Postgres round-trip.
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 3,
    initialInterval: '5s',
    backoffCoefficient: 2,
    maximumInterval: '20s',
  },
});

/** query-semantic-nodes skill. */
export async function querySemanticNodesWorkflow(input: { query_text: string; limit?: number }): Promise<SemanticNode[]> {
  return querySemanticNodes(input.query_text, input.limit);
}

/** autolink-entities skill. */
export async function autolinkEntitiesWorkflow(input: { entity_id: string }): Promise<SuggestedEdge[]> {
  return autolinkEntities(input.entity_id);
}
