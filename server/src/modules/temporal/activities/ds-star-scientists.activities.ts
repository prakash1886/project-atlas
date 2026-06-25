import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../../llm/llm.service.js';
import type {
  OpportunityReport,
  AudienceReport,
  StoryUniverseReport,
  ArchetypeMatrix,
  GeographicReport,
  DiscoveryReport,
  FormatPlaybook,
  BacklogRanking,
  AllScientistOutputs,
  TrendSources,
} from '../types/ds-star.types.js';

@Injectable()
export class DsStarScientistActivities {
  private readonly logger = new Logger(DsStarScientistActivities.name);

  constructor(private readonly llmService: LlmService) {}

  // ─── Scientist 1: Content Opportunity ─────────────────────────────────────
  // Nightly — analyses 6 trend sources to rank what to create next

  async runContentOpportunityScientist(sources: TrendSources): Promise<OpportunityReport> {
    this.logger.log('[Scientist:ContentOpportunity] Starting nightly trend analysis...');
    const result = await this.llmService.runDataScienceInsight(
      'content-opportunity',
      {
        query:
          'Analyse these 6 trend data sources. Identify rising and seasonal topics. ' +
          'Calculate Search Growth Score, Discussion Intensity Score, Virality Score, ' +
          'Monetization Score, and Evergreen Score. Return top 10 opportunities ranked ' +
          'by composite score with full justification for each.',
        data_files: Object.values(sources).filter(Boolean),
        max_refinement_rounds: 3,
      },
    );
    this.logger.log('[Scientist:ContentOpportunity] Completed. Opportunities scored.');
    return result as OpportunityReport;
  }

  // ─── Scientist 2: Audience ────────────────────────────────────────────────
  // Weekly — discovers who is actually watching by analysing behavioural data

  async runAudienceScientist(channelId: string): Promise<AudienceReport> {
    this.logger.log(`[Scientist:Audience] Analysing audience for channel: ${channelId}`);
    const result = await this.llmService.runDataScienceInsight(
      'audience-analysis',
      {
        query:
          'Analyse this YouTube channel\'s audience data including views, retention curves, ' +
          'comments sentiment, shares, geographic breakdown, and subscriber demographics. ' +
          'Identify the primary viewer demographics, content preferences by region, ' +
          'watch behaviour patterns, and emotional engagement triggers. ' +
          'Output structured audience persona cards.',
        data_files: [
          `${channelId}_analytics.csv`,
          `${channelId}_comments.json`,
          `${channelId}_geography.csv`,
        ],
        max_refinement_rounds: 2,
      },
    );
    this.logger.log(`[Scientist:Audience] Personas built for channel: ${channelId}`);
    return result as AudienceReport;
  }

  // ─── Scientist 3: Story Universe ──────────────────────────────────────────
  // Weekly per personality — compares story type retention within a personality's universe

  async runStoryUniverseScientist(personalityId: string): Promise<StoryUniverseReport> {
    this.logger.log(`[Scientist:StoryUniverse] Analysing story types for personality: ${personalityId}`);
    const result = await this.llmService.runDataScienceInsight(
      'story-universe',
      {
        query:
          'Compare retention curves across these story types: failure stories, origin stories, ' +
          'rivalry stories, legacy stories, comeback stories, product launch stories. ' +
          'Identify which story type drives highest average retention and watch time for this ' +
          'personality\'s video set. Recommend the next story type to produce with justification.',
        data_files: [
          `${personalityId}_video_retention.csv`,
          `${personalityId}_story_taxonomy.json`,
        ],
        max_refinement_rounds: 2,
      },
    );
    this.logger.log(`[Scientist:StoryUniverse] Story ranking complete for: ${personalityId}`);
    return result as StoryUniverseReport;
  }

  // ─── Scientist 4: Archetype ───────────────────────────────────────────────
  // Weekly — finds which psychological archetypes drive retention vs shares vs watch time

  async runArchetypeScientist(channelId: string): Promise<ArchetypeMatrix> {
    this.logger.log(`[Scientist:Archetype] Analysing archetypes for channel: ${channelId}`);
    const result = await this.llmService.runDataScienceInsight(
      'archetype-analysis',
      {
        query:
          'Analyse engagement data across all videos tagged by psychological archetype ' +
          '(underdog, rebel, visionary, mentor, hero, outlaw, explorer, sage). ' +
          'Determine which archetypes maximise: (1) average watch time, (2) share rate, ' +
          '(3) comment engagement rate, (4) subscriber conversion. ' +
          'Output a complete archetype performance matrix with production recommendations.',
        data_files: [
          `${channelId}_archetype_metrics.csv`,
          `${channelId}_engagement_by_archetype.json`,
        ],
        max_refinement_rounds: 3,
      },
    );
    this.logger.log('[Scientist:Archetype] Archetype matrix complete.');
    return result as ArchetypeMatrix;
  }

  // ─── Scientist 5: Geographic Intelligence ─────────────────────────────────
  // Weekly — learns regional preferences to inform backlog ranking

  async runGeographicScientist(channelId: string): Promise<GeographicReport> {
    this.logger.log(`[Scientist:Geographic] Analysing regional preferences for channel: ${channelId}`);
    const result = await this.llmService.runDataScienceInsight(
      'geographic-intelligence',
      {
        query:
          'Analyse geographic viewing patterns across this channel\'s content. ' +
          'Identify: (1) top 5 regions by watch time, (2) content preferences per region, ' +
          '(3) cultural engagement patterns such as India to Cricket Psychology or USA to Wrestling, ' +
          '(4) regional topic opportunities not yet covered. ' +
          'Map findings to concrete production backlog priorities.',
        data_files: [
          `${channelId}_geographic_analytics.csv`,
          `${channelId}_regional_trends.json`,
        ],
        max_refinement_rounds: 2,
      },
    );
    this.logger.log('[Scientist:Geographic] Regional strategy complete.');
    return result as GeographicReport;
  }

  // ─── Scientist 6: Hidden Legends Discovery ────────────────────────────────
  // Nightly — mines Wikipedia + archives for high story-quality / low-coverage personalities

  async runHiddenLegendsScientist(existingBacklogFile: string): Promise<DiscoveryReport> {
    this.logger.log('[Scientist:HiddenLegends] Mining archives for undiscovered personalities...');
    const result = await this.llmService.runDataScienceInsight(
      'hidden-legends-discovery',
      {
        query:
          'Mine the provided sources for personalities meeting ALL criteria: ' +
          '(1) high narrative quality — significant conflict, achievement, or drama in life story, ' +
          '(2) low existing YouTube coverage — best video under 500K views, ' +
          '(3) rising Wikipedia pageview trend — over 20% growth in the last 90 days, ' +
          '(4) monetizable niche — sport, business, philosophy, or history. ' +
          'Cross-reference against existing backlog to avoid duplicates. ' +
          'Return top 15 discoveries with opportunity score and recommended story angles.',
        data_files: [
          'wikipedia_batch.json',
          'archive_scan.json',
          existingBacklogFile,
        ],
        max_refinement_rounds: 3,
      },
    );
    this.logger.log('[Scientist:HiddenLegends] Discovery scan complete.');
    return result as DiscoveryReport;
  }

  // ─── Scientist 7: YouTube ─────────────────────────────────────────────────
  // Weekly — extracts production format insights from CTR, watch time, retention data

  async runYouTubeScientist(channelId: string): Promise<FormatPlaybook> {
    this.logger.log(`[Scientist:YouTube] Analysing format performance for channel: ${channelId}`);
    const result = await this.llmService.runDataScienceInsight(
      'youtube-format-analysis',
      {
        query:
          'Analyse production format performance across this channel\'s video catalogue. ' +
          'Find statistically significant patterns in: ' +
          '(1) optimal video length by topic category, ' +
          '(2) hook duration in seconds that maximises retention past the 30-second mark, ' +
          '(3) best publishing time by day and hour for this specific audience, ' +
          '(4) chapter structure patterns that reduce drop-off at key timestamps. ' +
          'Output a concrete production format playbook with confidence levels per finding.',
        data_files: [
          `${channelId}_studio_analytics.csv`,
          `${channelId}_retention_curves.json`,
          `${channelId}_ctr_data.csv`,
        ],
        max_refinement_rounds: 2,
      },
    );
    this.logger.log('[Scientist:YouTube] Format playbook complete.');
    return result as FormatPlaybook;
  }

  // ─── Scientist 8: Backlog ─────────────────────────────────────────────────
  // Nightly (after Opportunity + Hidden Legends) — synthesises all scientist outputs
  // into a ranked CREATE-NOW / CREATE-LATER / ARCHIVE list

  async runBacklogScientist(allOutputs: AllScientistOutputs): Promise<BacklogRanking> {
    this.logger.log('[Scientist:Backlog] Synthesising all scientist outputs into ranked backlog...');
    const result = await this.llmService.runDataScienceInsight(
      'backlog-ranking',
      {
        query:
          'Given inputs from all scientist agents, rank the full content backlog. ' +
          'Apply scoring weights: Trend Score 25%, Story Quality 25%, Geographic Demand 20%, ' +
          'Audience Fit 15%, Competition Gap 15%. ' +
          'Output three lists: CREATE-NOW (top 10 personalities to produce immediately), ' +
          'CREATE-LATER (next 30 opportunities), ARCHIVE (deprioritised). ' +
          'For each CREATE-NOW entry include recommended story type and archetype.',
        data_files: ['backlog_personalities.json'],
        scientist_outputs: allOutputs,
        max_refinement_rounds: 3,
      },
    );
    this.logger.log('[Scientist:Backlog] Ranked backlog ready. CREATE-NOW list updated.');
    return result as BacklogRanking;
  }
}
