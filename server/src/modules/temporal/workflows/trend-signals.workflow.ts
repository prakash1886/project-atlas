import { proxyActivities } from '@temporalio/workflow';
import type {
  TrendSignalsActivities,
  CoverageGapResult,
  SignalPoint,
  RawOpportunityMetrics,
  OpportunityScoreResult,
} from '../activities/trend-signals.activities.js';

const { computeCoverageGap, fetchSignals, calculateOpportunityScore } = proxyActivities<TrendSignalsActivities>({
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

/**
 * fetch-signals skill (openclaw/skills/fetch-signals): a thin workflow wrapper so the
 * already-implemented fetchSignals activity is reachable on its own via temporal-bridge's
 * start_workflow, not just as a step inside coverageGapWorkflow's siblings.
 */
export async function fetchSignalsWorkflow(input: { source: Parameters<TrendSignalsActivities['fetchSignals']>[0]; query: string }): Promise<SignalPoint[]> {
  return fetchSignals(input.source, input.query);
}

/** calculate-opportunity-score skill: thin wrapper around the pure-arithmetic activity. */
export async function calculateOpportunityScoreWorkflow(input: RawOpportunityMetrics): Promise<OpportunityScoreResult> {
  return calculateOpportunityScore(input);
}
