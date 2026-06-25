// DS-STAR Scientist Types — Project Atlas
// Input/output contracts for all 8 specialized scientist agents

// ─── Shared ─────────────────────────────────────────────────────────────────

export interface DsStarRunRequest {
  query: string;
  data_files: string[];        // filenames relative to /opt/ds-star/data/
  insight_type: string;
  max_refinement_rounds?: number;
}

export interface DsStarRunResponse {
  run_id: string;
  result: Record<string, unknown>;
  status: 'success' | 'partial' | 'error';
  cost_estimate_usd: number;
}

// ─── Scientist 1: Content Opportunity ───────────────────────────────────────

export interface TrendSources {
  google_trends_file: string;
  youtube_trends_file: string;
  reddit_file: string;
  wikipedia_file: string;
  news_file: string;
  search_volume_file: string;
}

export interface ContentOpportunity {
  topic: string;
  search_growth_score: number;
  discussion_intensity_score: number;
  virality_score: number;
  monetization_score: number;
  evergreen_score: number;
  composite_score: number;
  reasons: string[];
}

export interface OpportunityReport {
  generated_at: string;
  top_opportunities: ContentOpportunity[];
  merchandise_opportunities: string[];
  audience_opportunities: string[];
  forecasted_trends: string[];
}

// ─── Scientist 2: Audience ───────────────────────────────────────────────────

export interface AudiencePersona {
  segment_name: string;
  age_range: string;
  top_regions: string[];
  content_preferences: string[];
  watch_behaviour: string;
  emotional_triggers: string[];
  share_propensity: 'low' | 'medium' | 'high';
}

export interface AudienceReport {
  channel_id: string;
  generated_at: string;
  primary_persona: AudiencePersona;
  secondary_personas: AudiencePersona[];
  geographic_breakdown: Record<string, number>;
  retention_insights: string[];
}

// ─── Scientist 3: Story Universe ─────────────────────────────────────────────

export type StoryType =
  | 'failure_story'
  | 'origin_story'
  | 'rivalry_story'
  | 'legacy_story'
  | 'comeback_story'
  | 'product_launch_story'
  | 'underdog_story';

export interface StoryTypePerformance {
  story_type: StoryType;
  avg_retention_pct: number;
  avg_watch_time_minutes: number;
  sample_size: number;
  top_performing_video_id?: string;
}

export interface StoryUniverseReport {
  personality_id: string;
  generated_at: string;
  ranked_story_types: StoryTypePerformance[];
  recommended_next_story_type: StoryType;
  recommendation_reason: string;
}

// ─── Scientist 4: Archetype ──────────────────────────────────────────────────

export type Archetype =
  | 'underdog'
  | 'rebel'
  | 'visionary'
  | 'mentor'
  | 'hero'
  | 'outlaw'
  | 'explorer'
  | 'sage';

export interface ArchetypeMetrics {
  archetype: Archetype;
  avg_watch_time_minutes: number;
  avg_retention_pct: number;
  share_rate: number;
  comment_engagement_rate: number;
  subscriber_conversion_rate: number;
  video_count: number;
}

export interface ArchetypeMatrix {
  generated_at: string;
  archetype_performance: ArchetypeMetrics[];
  best_for_retention: Archetype;
  best_for_shares: Archetype;
  best_for_watch_time: Archetype;
  production_recommendations: string[];
}

// ─── Scientist 5: Geographic Intelligence ────────────────────────────────────

export interface RegionalPreference {
  region: string;
  country_code: string;
  watch_time_pct: number;
  top_content_categories: string[];
  cultural_hooks: string[];
  opportunity_score: number;
}

export interface GeographicReport {
  channel_id: string;
  generated_at: string;
  top_regions: RegionalPreference[];
  regional_topic_opportunities: Record<string, string[]>;
  backlog_priority_adjustments: Record<string, number>;
}

// ─── Scientist 6: Hidden Legends Discovery ───────────────────────────────────

export interface LegendDiscovery {
  name: string;
  domain: string;
  story_quality_score: number;
  coverage_gap_score: number;
  wikipedia_pageview_growth_pct: number;
  existing_best_video_views: number;
  opportunity_score: number;
  story_angles: string[];
  sources: string[];
}

export interface DiscoveryReport {
  generated_at: string;
  discoveries: LegendDiscovery[];
  total_scanned: number;
  filter_criteria: string[];
}

// ─── Scientist 7: YouTube ────────────────────────────────────────────────────

export interface FormatInsight {
  metric: string;
  finding: string;
  confidence: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface FormatPlaybook {
  channel_id: string;
  generated_at: string;
  optimal_video_length_by_topic: Record<string, number>;
  best_hook_duration_seconds: number;
  best_publish_times: { day: string; hour_utc: number }[];
  chapter_structure_recommendations: string[];
  insights: FormatInsight[];
}

// ─── Scientist 8: Backlog ────────────────────────────────────────────────────

export interface BacklogEntry {
  personality_id: string;
  name: string;
  composite_score: number;
  trend_score: number;
  story_quality_score: number;
  geographic_demand_score: number;
  audience_fit_score: number;
  competition_gap_score: number;
  recommended_story_type?: StoryType;
  recommended_archetype?: Archetype;
}

export interface BacklogRanking {
  generated_at: string;
  create_now: BacklogEntry[];     // top 10
  create_later: BacklogEntry[];   // next 30
  archive: BacklogEntry[];        // deprioritised
  scoring_weights: {
    trend: number;
    story_quality: number;
    geographic_demand: number;
    audience_fit: number;
    competition_gap: number;
  };
}

// ─── Orchestration Inputs ────────────────────────────────────────────────────

export interface AllScientistOutputs {
  opportunities?: OpportunityReport;
  legends?: DiscoveryReport;
  audience?: AudienceReport;
  story_universe?: StoryUniverseReport[];
  archetypes?: ArchetypeMatrix;
  geographic?: GeographicReport;
  youtube?: FormatPlaybook;
}

export interface WeeklyIntelligenceInput {
  channel_ids: string[];
  personality_ids: string[];
}

export interface WeeklyIntelligenceReport {
  week_ending: string;
  audience: AudienceReport;
  archetypes: ArchetypeMatrix;
  geographic: GeographicReport;
  youtube: FormatPlaybook;
  story_universe: StoryUniverseReport[];
}
