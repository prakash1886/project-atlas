import { Injectable, Logger } from '@nestjs/common';
import { SearchService, type SearchSource } from '../../search/search.service.js';

/** A normalized trend signal, matching the fetch-signals skill contract (SYS-TREND F-002). */
export interface SignalPoint {
  datetime: string;
  metric: string;
  value: number;
}

/** Coverage-gap agent output (atlas-agents.json §3.1): demand vs existing-supply. */
export interface CoverageGapResult {
  personality: string;
  interest_score: number; // Brave web/news demand proxy (0–100)
  coverage_score: number; // Exa existing-content supply proxy (0–100)
  gap_score: number; // demand minus supply — high = under-served opportunity
  sources: { brave: number; exa: number };
}

/** Raw weighted-component inputs to the opportunity score, each 0-100 (calculate-opportunity-score skill). */
export interface RawOpportunityMetrics {
  topic: string;
  search: number;
  discussion: number;
  video: number;
  evergreen: number;
  emotional: number;
  competition: number;
  monetization: number;
  regional: number;
}

export interface OpportunityScoreResult {
  topic: string;
  final_score: number;
  classification: 'create_now' | 'create_later' | 'archive';
}

/**
 * Server-side fetch-signals path for the trend pipeline (SYS-SEARCH F-008/F-009).
 * Runs Brave + Exa through the cached, rate-limited SearchService rather than raw MCP, so bulk
 * polling honors the search_cache gate and Redis limiter. Registered as Temporal activities.
 */
@Injectable()
export class TrendSignalsActivities {
  private readonly logger = new Logger(TrendSignalsActivities.name);

  constructor(private readonly search: SearchService) {}

  /** Fetch raw volume for one source/query, normalized to {datetime, metric, value}. */
  async fetchSignals(source: SearchSource, query: string): Promise<SignalPoint[]> {
    const res = await this.search.search(source, query);
    this.logger.log(`[fetchSignals] ${source} "${query}" → ${res.resultCount} (cached=${res.cached})`);
    return [{ datetime: res.fetchedAt, metric: `${source}_result_count`, value: res.resultCount }];
  }

  /**
   * Compute a coverage gap for a personality: Brave demand vs Exa content-supply.
   * Heuristic proxy scoring — the authoritative score is calculate-opportunity-score; this just
   * ranks candidates by under-served-ness for the Coverage Gap agent.
   */
  async computeCoverageGap(personality: string): Promise<CoverageGapResult> {
    const [demand, supply] = await Promise.all([
      this.search.braveSearch(personality, 20),
      this.search.exaSearch(`${personality} biography story psychology analysis`, 20),
    ]);
    const interest = Math.min(100, demand.resultCount * 5);
    const coverage = Math.min(100, supply.resultCount * 5);
    const gap = Math.max(0, interest - coverage);
    this.logger.log(`[computeCoverageGap] ${personality}: interest=${interest} coverage=${coverage} gap=${gap}`);
    return {
      personality,
      interest_score: interest,
      coverage_score: coverage,
      gap_score: gap,
      sources: { brave: demand.resultCount, exa: supply.resultCount },
    };
  }

  /**
   * Weighted-sum opportunity score (calculate-opportunity-score skill, manifest §2):
   * Search 20% + Discussion 15% + Video 15% + Evergreen 15% + Emotional 10% + Competition 10%
   * + Monetization 10% + Regional 5%. Pure arithmetic at zero LLM cost, per the skill's own
   * "computation-first" requirement -- no model call here.
   */
  async calculateOpportunityScore(raw: RawOpportunityMetrics): Promise<OpportunityScoreResult> {
    const final_score = Math.round(
      raw.search * 0.2 +
        raw.discussion * 0.15 +
        raw.video * 0.15 +
        raw.evergreen * 0.15 +
        raw.emotional * 0.1 +
        raw.competition * 0.1 +
        raw.monetization * 0.1 +
        raw.regional * 0.05
    );
    const classification = final_score >= 75 ? 'create_now' : final_score >= 50 ? 'create_later' : 'archive';
    this.logger.log(`[calculateOpportunityScore] ${raw.topic}: final_score=${final_score} (${classification})`);
    return { topic: raw.topic, final_score, classification };
  }
}
