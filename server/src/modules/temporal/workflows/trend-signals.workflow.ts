import { proxyActivities } from '@temporalio/workflow';
import type { TrendSignalsActivities, CoverageGapResult } from '../activities/trend-signals.activities.js';

const { computeCoverageGap } = proxyActivities<TrendSignalsActivities>({
  taskQueue: 'trend-signals',
  // Each call = 2 provider round-trips (Brave + Exa) through the cached SearchService
  startToCloseTimeout: '2 minutes',
  retry: {
    maximumAttempts: 3,
    initialInterval: '5s',
    backoffCoefficient: 2,
    maximumInterval: '30s',
  },
});

/**
 * Coverage Gap Workflow (SYS-SEARCH).
 * Scores a list of candidate personalities by demand-vs-supply gap using live Brave + Exa data,
 * returning them ranked high-gap first to feed the content backlog.
 */
export async function coverageGapWorkflow(input: { personalities: string[] }): Promise<CoverageGapResult[]> {
  const results = await Promise.all(input.personalities.map((p) => computeCoverageGap(p)));
  return results.sort((a, b) => b.gap_score - a.gap_score);
}
