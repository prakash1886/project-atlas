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
}
