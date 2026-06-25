import { proxyActivities } from '@temporalio/workflow';
import type { DsStarScientistActivities } from '../activities/ds-star-scientists.activities.js';
import type {
  WeeklyIntelligenceReport,
  WeeklyIntelligenceInput,
  AudienceReport,
  ArchetypeMatrix,
  GeographicReport,
  FormatPlaybook,
  StoryUniverseReport,
} from '../types/ds-star.types.js';

const {
  runAudienceScientist,
  runArchetypeScientist,
  runGeographicScientist,
  runYouTubeScientist,
  runStoryUniverseScientist,
} = proxyActivities<DsStarScientistActivities>({
  taskQueue: 'ds-star-science',
  // Weekly scientists are analytical — allow enough time for 2-3 DS-STAR iterations
  startToCloseTimeout: '6 minutes',
  scheduleToCloseTimeout: '45 minutes',
  retry: {
    maximumAttempts: 2,
    initialInterval: '30s',
    backoffCoefficient: 2,
    maximumInterval: '2 minutes',
  },
});

/**
 * Weekly Intelligence Workflow
 *
 * Runs every Sunday at midnight IST (18:30 UTC).
 * All 5 weekly scientists execute concurrently — no dependencies between them.
 * StoryUniverse runs once per active personality in parallel.
 *
 * Schedule cron: "30 18 * * 0"  →  18:30 UTC = 00:00 IST Monday
 */
export async function weeklyIntelligenceWorkflow(
  input: WeeklyIntelligenceInput,
): Promise<WeeklyIntelligenceReport> {
  const primaryChannel = input.channel_ids[0];
  const weekEnding = new Date().toISOString().split('T')[0];

  // All 5 weekly scientists run fully in parallel — independent data sources
  const [audience, archetypes, geographic, youtube, storyUniverseResults]: [
    AudienceReport,
    ArchetypeMatrix,
    GeographicReport,
    FormatPlaybook,
    StoryUniverseReport[],
  ] = await Promise.all([
    runAudienceScientist(primaryChannel),
    runArchetypeScientist(primaryChannel),
    runGeographicScientist(primaryChannel),
    runYouTubeScientist(primaryChannel),
    // Story Universe runs per-personality — fan out across all active personalities
    Promise.all(input.personality_ids.map((id) => runStoryUniverseScientist(id))),
  ]);

  return {
    week_ending: weekEnding,
    audience,
    archetypes,
    geographic,
    youtube,
    story_universe: storyUniverseResults,
  };
}
