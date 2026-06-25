import { proxyActivities } from '@temporalio/workflow';
import type { DsStarScientistActivities } from '../activities/ds-star-scientists.activities.js';
import type {
  OpportunityReport,
  DiscoveryReport,
  BacklogRanking,
  TrendSources,
} from '../types/ds-star.types.js';

const {
  runContentOpportunityScientist,
  runHiddenLegendsScientist,
  runBacklogScientist,
} = proxyActivities<DsStarScientistActivities>({
  taskQueue: 'ds-star-science',
  // Nightly scientists need generous timeouts — DS-STAR runs up to 3 iterations
  startToCloseTimeout: '8 minutes',
  retry: {
    maximumAttempts: 2,
    initialInterval: '30s',
    backoffCoefficient: 2,
    maximumInterval: '2 minutes',
  },
});

/**
 * Nightly Intelligence Workflow
 *
 * Runs every night at 2am IST (20:30 UTC).
 * Chain: ContentOpportunity + HiddenLegends (parallel) → Backlog (synthesis)
 *
 * Schedule: register in Railway with TEMPORAL_SCHEDULE_NIGHTLY env var
 * Cron: "30 20 * * *"  →  20:30 UTC = 02:00 IST
 */
export async function nightlyIntelligenceWorkflow(input: {
  trend_sources: TrendSources;
  existing_backlog_file: string;
}): Promise<BacklogRanking> {

  // Step 1 — Run Opportunity + Hidden Legends scientists in parallel
  // These are independent: one scans trends, the other scans archives
  const [opportunities, legends]: [OpportunityReport, DiscoveryReport] = await Promise.all([
    runContentOpportunityScientist(input.trend_sources),
    runHiddenLegendsScientist(input.existing_backlog_file),
  ]);

  // Step 2 — Backlog Scientist synthesises both outputs into ranked list
  // This depends on the above completing first
  const backlog: BacklogRanking = await runBacklogScientist({
    opportunities,
    legends,
  });

  return backlog;
}
