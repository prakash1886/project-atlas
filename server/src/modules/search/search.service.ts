import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Pool } from 'pg';

export type SearchSource = 'brave' | 'exa';

export interface SearchResultItem {
  title: string;
  url: string;
  snippet?: string;
}

export interface SearchResult {
  source: SearchSource;
  query: string;
  cached: boolean;
  fetchedAt: string;
  resultCount: number;
  /** Populated ONLY on a live fetch (transient, returned to caller, never persisted). Empty on cache hit / stub. */
  results: SearchResultItem[];
  /** True when the monthly free-tier cap was hit and the live call was suppressed (zero-overage policy). */
  capped?: boolean;
  /** True when a stub was returned (no key, rate-limited, capped, or error). */
  stubbed?: boolean;
}

/**
 * Interim provider governance (SYS-POLICY). These are externalized to the version-pinned
 * provider-policies/<provider>.policy.json manifest in the PolicyService layer; embedded here for now.
 */
interface ProviderLimits {
  freeMonthlyCap: number; // free-tier / free-credit request allowance
  safetyMargin: number; // cap at this fraction to absorb concurrency / in-flight (zero paid overage)
  costPer1kUsd: number; // for the ledger cost estimate
  allowPaidOverage: boolean; // default false → never spend past the free tier
  perMinuteRate: number; // burst guard, well under the provider's documented QPS
  endpoint: string;
}

const PROVIDERS: Record<SearchSource, ProviderLimits> = {
  // Brave $5 Search plan: 50 QPS, $5/mo credit (~1,000 req). storageRights=false → signals-only cache.
  brave: { freeMonthlyCap: 1000, safetyMargin: 0.9, costPer1kUsd: 5, allowPaidOverage: false, perMinuteRate: 30, endpoint: 'web/search' },
  // Exa free tier: 20,000 req/mo, /search 10 QPS.
  exa: { freeMonthlyCap: 20000, safetyMargin: 0.95, costPer1kUsd: 7, allowPaidOverage: false, perMinuteRate: 60, endpoint: 'search' },
};

const CACHE_TTL_DAYS = 30; // 30-day no-repeat gate (SYS-SEARCH F-006 / spec §6.2)

/**
 * SearchService — cached, rate-limited, cost-capped Brave + Exa search for the trend pipeline.
 * Compliance (SYS-POLICY): caches only a derived numeric signal (result_count), never result bodies,
 * so it is safe on Brave's non-storage-rights $5 plan. Cost: an atomic monthly counter enforces a
 * zero-paid-overage cap per provider — fail-CLOSED so an outage can never cause spend. Never throws.
 */
@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly braveKey = process.env.BRAVE_API_KEY;
  private readonly exaKey = process.env.EXA_API_KEY;

  constructor(
    @Inject('DATABASE_POOL') private readonly db: Pool,
    @Inject('REDIS_CLIENT') private readonly redis: unknown,
  ) {
    this.logger.log(
      `[SearchService] init (brave=${this.braveKey ? 'live' : 'stub'}, exa=${this.exaKey ? 'live' : 'stub'}; ` +
        `caps brave=${this.effectiveCap('brave')} exa=${this.effectiveCap('exa')} /mo, zero paid overage)`,
    );
  }

  braveSearch(query: string, count = 10): Promise<SearchResult> {
    return this.search('brave', query, count);
  }

  exaSearch(query: string, count = 10): Promise<SearchResult> {
    return this.search('exa', query, count);
  }

  /** cache gate → key → burst limit → monthly cap reserve → live call → ledger + signals-only cache. */
  async search(source: SearchSource, query: string, count = 10): Promise<SearchResult> {
    // 1. signals-only cache hit — zero outbound calls, zero quota spent (F-006)
    const hit = await this.readCache(source, query);
    if (hit) {
      return { source, query, cached: true, fetchedAt: hit.fetchedAt, resultCount: hit.value, results: [] };
    }

    // 2. credential check
    const key = source === 'brave' ? this.braveKey : this.exaKey;
    if (!key) {
      this.logger.warn(`[SearchService] ${source} key missing — stub for "${query}"`);
      return this.stub(source, query);
    }

    // 3. per-minute burst guard — fail-open; cache + monthly cap are the real protection (F-005)
    if (!(await this.underRateLimit(source))) {
      this.logger.warn(`[SearchService] ${source} burst-limited — stub for "${query}"`);
      return this.stub(source, query);
    }

    // 4. monthly zero-overage cap — atomic reserve, FAIL CLOSED (cost safety > availability) (F-008)
    if (!(await this.reserveMonthlyQuota(source))) {
      this.logger.warn(`[SearchService] ${source} monthly free-tier cap reached — suppressing call (zero-overage)`);
      // TODO(SYS-POLICY): emit Operator Dashboard alert
      return { ...this.stub(source, query), capped: true };
    }

    // 5. live call → ledger → signals-only cache (result bodies returned to caller, never stored)
    try {
      const results = source === 'brave' ? await this.callBrave(query, count, key) : await this.callExa(query, count, key);
      await this.writeLedger(source);
      await this.writeCache(source, query, results.length);
      return { source, query, cached: false, fetchedAt: new Date().toISOString(), resultCount: results.length, results };
    } catch (e) {
      await this.writeLedger(source); // an attempted call still counts toward usage (conservative)
      this.logger.error(`[SearchService] ${source} error for "${query}": ${e}`);
      return this.stub(source, query);
    }
  }

  /** Current month's usage vs cap for a provider (Operator Dashboard / tests). */
  async getMonthlyUsage(source: SearchSource): Promise<{ used: number; cap: number; remaining: number }> {
    const cap = this.effectiveCap(source);
    let used = 0;
    try {
      const res = await this.db.query(
        `SELECT COALESCE(SUM(request_count), 0) AS used FROM api_usage_ledger WHERE provider = $1 AND day >= $2`,
        [source, this.monthStart()],
      );
      used = Number(res.rows[0]?.used ?? 0);
    } catch {
      /* ledger unavailable → report 0 used */
    }
    return { used, cap, remaining: Math.max(0, cap - used) };
  }

  // --- providers -------------------------------------------------------------

  private async callBrave(query: string, count: number, key: string): Promise<SearchResultItem[]> {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`;
    const res = await fetch(url, { headers: { 'X-Subscription-Token': key, Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Brave API responded with status ${res.status}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data?.web?.results ?? []).map((r: any) => ({ title: r.title, url: r.url, snippet: r.description }));
  }

  private async callExa(query: string, count: number, key: string): Promise<SearchResultItem[]> {
    const res = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: { 'x-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, numResults: count, type: 'auto' }),
    });
    if (!res.ok) throw new Error(`Exa API responded with status ${res.status}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data?.results ?? []).map((r: any) => ({ title: r.title, url: r.url, snippet: typeof r.text === 'string' ? r.text.slice(0, 200) : undefined }));
  }

  // --- search_cache (SIGNALS-ONLY — never stores provider result bodies, SYS-POLICY F-003) ----------

  private async readCache(source: SearchSource, query: string): Promise<{ value: number; fetchedAt: string } | null> {
    try {
      const cutoff = new Date(Date.now() - CACHE_TTL_DAYS * 86_400_000);
      const res = await this.db.query(
        `SELECT value, fetched_at FROM search_cache WHERE source = $1 AND query = $2 AND fetched_at > $3`,
        [source, query, cutoff],
      );
      if (!res.rows.length) return null;
      const row = res.rows[0];
      const fetchedAt = row.fetched_at instanceof Date ? row.fetched_at.toISOString() : String(row.fetched_at);
      return { value: Number(row.value), fetchedAt };
    } catch (e) {
      this.logger.warn(`[SearchService] cache read failed (treating as miss): ${e}`);
      return null;
    }
  }

  private async writeCache(source: SearchSource, query: string, resultCount: number): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO search_cache (source, query, metric, value, fetched_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (source, query) DO UPDATE SET metric = EXCLUDED.metric, value = EXCLUDED.value, fetched_at = CURRENT_TIMESTAMP`,
        [source, query, `${source}_result_count`, resultCount],
      );
    } catch (e) {
      this.logger.warn(`[SearchService] cache write failed (non-fatal): ${e}`);
    }
  }

  // --- cost: monthly zero-overage cap + ledger (SYS-POLICY F-007/F-008/F-009a) ----------------------

  private effectiveCap(source: SearchSource): number {
    const c = PROVIDERS[source];
    return Math.floor(c.freeMonthlyCap * c.safetyMargin);
  }

  private monthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  /**
   * Reserve one unit of this month's quota. Atomic via Redis INCR (reserve-before-call so concurrent
   * agents can't collectively overshoot). FAILS CLOSED — if neither Redis nor the ledger can confirm
   * we're under cap, deny the call rather than risk paid overage.
   */
  private async reserveMonthlyQuota(source: SearchSource): Promise<boolean> {
    const cfg = PROVIDERS[source];
    if (cfg.allowPaidOverage) return true; // explicitly opted into paid usage
    const cap = this.effectiveCap(source);
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Preferred: atomic Redis counter
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = this.redis as any;
      if (r && typeof r.incr === 'function') {
        const k = `apiquota:${source}:${month}`;
        const n: number = await r.incr(k);
        if (n === 1 && typeof r.expire === 'function') await r.expire(k, 60 * 60 * 24 * 40); // ~40d
        if (n > cap) {
          try {
            await r.decr(k); // roll back the over-cap reservation
          } catch {
            /* ignore */
          }
          return false;
        }
        return true;
      }
    } catch {
      /* Redis unavailable → fall through to ledger-count fallback */
    }

    // Fallback: count this month's ledger. Less atomic, but fail-closed on error (cost > availability).
    try {
      const res = await this.db.query(
        `SELECT COALESCE(SUM(request_count), 0) AS used FROM api_usage_ledger WHERE provider = $1 AND day >= $2`,
        [source, this.monthStart()],
      );
      return Number(res.rows[0]?.used ?? 0) < cap;
    } catch (e) {
      this.logger.error(`[SearchService] quota check failed — denying to avoid overage: ${e}`);
      return false; // FAIL CLOSED
    }
  }

  private async writeLedger(source: SearchSource): Promise<void> {
    const cfg = PROVIDERS[source];
    try {
      await this.db.query(
        `INSERT INTO api_usage_ledger (provider, endpoint, request_count, est_cost_usd, day)
         VALUES ($1, $2, 1, $3, CURRENT_DATE)`,
        [source, cfg.endpoint, cfg.costPer1kUsd / 1000],
      );
    } catch (e) {
      this.logger.warn(`[SearchService] ledger write failed (non-fatal): ${e}`);
    }
  }

  // --- per-minute burst limiter (best-effort, fail-open) -------------------------------------------

  private async underRateLimit(source: SearchSource): Promise<boolean> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = this.redis as any;
      if (!r || typeof r.incr !== 'function') return true; // no real Redis → allow (cap still guards cost)
      const bucket = Math.floor(Date.now() / 60_000);
      const k = `ratelimit:search:${source}:${bucket}`;
      const n: number = await r.incr(k);
      if (n === 1 && typeof r.expire === 'function') await r.expire(k, 60);
      return n <= PROVIDERS[source].perMinuteRate;
    } catch {
      return true; // Redis unreachable → fail-open; cache + monthly cap remain the cost protection
    }
  }

  // --- stub ----------------------------------------------------------------------------------------

  private stub(source: SearchSource, query: string): SearchResult {
    return { source, query, cached: false, fetchedAt: new Date().toISOString(), resultCount: 0, results: [], stubbed: true };
  }
}
