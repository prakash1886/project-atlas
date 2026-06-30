import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Pool } from 'pg';

export type SearchSource = 'brave' | 'exa' | 'currents' | 'freenews' | 'wikipedia';

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
  freeCap: number; // free-tier / free-credit request allowance, scoped to capPeriod ('none' → unused)
  capPeriod: 'monthly' | 'daily' | 'none'; // 'none' = no quota-exhaustion concept, only perMinuteRate applies
  requiresKey: boolean; // false for keyless providers (e.g. Wikipedia anonymous access)
  safetyMargin: number; // cap at this fraction to absorb concurrency / in-flight (zero paid overage)
  costPer1kUsd: number; // for the ledger cost estimate
  allowPaidOverage: boolean; // default false → never spend past the free tier
  perMinuteRate: number; // burst guard, well under the provider's documented QPS
  endpoint: string;
}

const PROVIDERS: Record<SearchSource, ProviderLimits> = {
  // Brave $5 Search plan: 50 QPS, $5/mo credit (~1,000 req). storageRights=false → signals-only cache.
  brave: { freeCap: 1000, capPeriod: 'monthly', requiresKey: true, safetyMargin: 0.9, costPer1kUsd: 5, allowPaidOverage: false, perMinuteRate: 30, endpoint: 'web/search' },
  // Exa free tier: 20,000 req/mo, /search 10 QPS.
  exa: { freeCap: 20000, capPeriod: 'monthly', requiresKey: true, safetyMargin: 0.95, costPer1kUsd: 7, allowPaidOverage: false, perMinuteRate: 60, endpoint: 'search' },
  // Currents free tier: 1,000 req/DAY (confirmed live via X-Ratelimit-Limit header), resets at UTC
  // midnight -- not monthly, hence capPeriod: 'daily'.
  currents: { freeCap: 1000, capPeriod: 'daily', requiresKey: true, safetyMargin: 0.9, costPer1kUsd: 0, allowPaidOverage: false, perMinuteRate: 60, endpoint: 'search' },
  // FreeNewsApi.io free tier: 5,000 req/day, no paid tier exists. Server was unresponsive in live
  // testing (TLS connects, no response) -- kept here since the existing stub-on-error path already
  // degrades gracefully; treat as a secondary/fallback news source, not primary.
  freenews: { freeCap: 5000, capPeriod: 'daily', requiresKey: true, safetyMargin: 0.9, costPer1kUsd: 0, allowPaidOverage: false, perMinuteRate: 60, endpoint: 'v1/news' },
  // Wikipedia REST API: keyless, no quota to exhaust -- api.wikimedia.org's old personal-token portal
  // 301-redirects to mediawiki.org now (confirmed live), so there's no key-signup flow to wire up.
  // Anonymous + compliant User-Agent gets 200 req/min (vs 10 req/min with none) per Wikimedia's
  // current rate-limit policy; perMinuteRate kept safely under that ceiling. freeCap/safetyMargin
  // unused for capPeriod: 'none' (see reserveQuota).
  wikipedia: { freeCap: 0, capPeriod: 'none', requiresKey: false, safetyMargin: 1, costPer1kUsd: 0, allowPaidOverage: false, perMinuteRate: 150, endpoint: 'v1/search/page' },
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
  private readonly currentsKey = process.env.CURRENTS_API_KEY;
  private readonly freenewsKey = process.env.FREENEWS_API_KEY;

  constructor(
    @Inject('DATABASE_POOL') private readonly db: Pool,
    @Inject('REDIS_CLIENT') private readonly redis: unknown,
  ) {
    this.logger.log(
      `[SearchService] init (brave=${this.braveKey ? 'live' : 'stub'}, exa=${this.exaKey ? 'live' : 'stub'}, ` +
        `currents=${this.currentsKey ? 'live' : 'stub'}, freenews=${this.freenewsKey ? 'live' : 'stub'}, wikipedia=live (keyless); ` +
        `caps brave=${this.effectiveCap('brave')}/mo exa=${this.effectiveCap('exa')}/mo ` +
        `currents=${this.effectiveCap('currents')}/day freenews=${this.effectiveCap('freenews')}/day ` +
        `wikipedia=${PROVIDERS.wikipedia.perMinuteRate}/min, zero paid overage)`,
    );
  }

  braveSearch(query: string, count = 10): Promise<SearchResult> {
    return this.search('brave', query, count);
  }

  exaSearch(query: string, count = 10): Promise<SearchResult> {
    return this.search('exa', query, count);
  }

  currentsSearch(query: string, count = 10): Promise<SearchResult> {
    return this.search('currents', query, count);
  }

  freenewsSearch(query: string, count = 10): Promise<SearchResult> {
    return this.search('freenews', query, count);
  }

  wikipediaSearch(query: string, count = 10): Promise<SearchResult> {
    return this.search('wikipedia', query, count);
  }

  /** cache gate → key → burst limit → monthly cap reserve → live call → ledger + signals-only cache. */
  async search(source: SearchSource, query: string, count = 10): Promise<SearchResult> {
    // 1. signals-only cache hit — zero outbound calls, zero quota spent (F-006)
    const hit = await this.readCache(source, query);
    if (hit) {
      return { source, query, cached: true, fetchedAt: hit.fetchedAt, resultCount: hit.value, results: [] };
    }

    // 2. credential check (skipped for keyless providers, e.g. Wikipedia anonymous access)
    const key = this.keyFor(source);
    if (PROVIDERS[source].requiresKey && !key) {
      this.logger.warn(`[SearchService] ${source} key missing — stub for "${query}"`);
      return this.stub(source, query);
    }

    // 3. per-minute burst guard — fail-open; cache + monthly cap are the real protection (F-005)
    if (!(await this.underRateLimit(source))) {
      this.logger.warn(`[SearchService] ${source} burst-limited — stub for "${query}"`);
      return this.stub(source, query);
    }

    // 4. zero-overage cap — atomic reserve, FAIL CLOSED (cost safety > availability) (F-008)
    if (!(await this.reserveQuota(source))) {
      this.logger.warn(`[SearchService] ${source} ${PROVIDERS[source].capPeriod} free-tier cap reached — suppressing call (zero-overage)`);
      // TODO(SYS-POLICY): emit Operator Dashboard alert
      return { ...this.stub(source, query), capped: true };
    }

    // 5. live call → ledger → signals-only cache (result bodies returned to caller, never stored)
    try {
      const results = await this.callProvider(source, query, count, key ?? '');
      await this.writeLedger(source);
      await this.writeCache(source, query, results.length);
      return { source, query, cached: false, fetchedAt: new Date().toISOString(), resultCount: results.length, results };
    } catch (e) {
      await this.writeLedger(source); // an attempted call still counts toward usage (conservative)
      this.logger.error(`[SearchService] ${source} error for "${query}": ${e}`);
      return this.stub(source, query);
    }
  }

  /** Current usage vs cap for a provider, scoped to its real cap period (Operator Dashboard / tests). */
  async getUsage(source: SearchSource): Promise<{ used: number; cap: number; remaining: number; period: 'monthly' | 'daily' | 'none' }> {
    const cap = this.effectiveCap(source);
    const period = PROVIDERS[source].capPeriod;
    const since = period === 'monthly' ? this.monthStart() : this.dayStart(); // 'none' providers don't consult this, harmless default
    let used = 0;
    try {
      const res = await this.db.query(
        `SELECT COALESCE(SUM(request_count), 0) AS used FROM api_usage_ledger WHERE provider = $1 AND day >= $2`,
        [source, since],
      );
      used = Number(res.rows[0]?.used ?? 0);
    } catch {
      /* ledger unavailable → report 0 used */
    }
    return { used, cap, remaining: Math.max(0, cap - used), period };
  }

  /** @deprecated use getUsage — kept for any existing monthly-only callers. */
  async getMonthlyUsage(source: SearchSource): Promise<{ used: number; cap: number; remaining: number }> {
    const { used, cap, remaining } = await this.getUsage(source);
    return { used, cap, remaining };
  }

  // --- providers -------------------------------------------------------------

  private keyFor(source: SearchSource): string | undefined {
    switch (source) {
      case 'brave': return this.braveKey;
      case 'exa': return this.exaKey;
      case 'currents': return this.currentsKey;
      case 'freenews': return this.freenewsKey;
      case 'wikipedia': return undefined; // keyless
    }
  }

  private callProvider(source: SearchSource, query: string, count: number, key: string): Promise<SearchResultItem[]> {
    switch (source) {
      case 'brave': return this.callBrave(query, count, key);
      case 'exa': return this.callExa(query, count, key);
      case 'currents': return this.callCurrents(query, count, key);
      case 'freenews': return this.callFreenews(query, count, key);
      case 'wikipedia': return this.callWikipedia(query, count);
    }
  }

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

  /** Response shape confirmed live: {"status":"ok","news":[{title,url,description,...}],"page":1}. */
  private async callCurrents(query: string, count: number, key: string): Promise<SearchResultItem[]> {
    const url = `https://api.currentsapi.services/v1/search?keywords=${encodeURIComponent(query)}&apiKey=${key}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Currents API responded with status ${res.status}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data?.news ?? []).slice(0, count).map((r: any) => ({ title: r.title, url: r.url, snippet: r.description }));
  }

  /**
   * Best-effort per published docs -- live testing showed the server accepting the TLS connection
   * then never responding (10s+ hang on every attempt). Relies on this method's own fetch timeout
   * plus search()'s existing catch-and-stub path to degrade gracefully rather than hang the caller.
   */
  private async callFreenews(query: string, count: number, key: string): Promise<SearchResultItem[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const url = `https://api.freenewsapi.io/v1/news?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { 'x-api-key': key }, signal: controller.signal });
      if (!res.ok) throw new Error(`FreeNewsApi responded with status ${res.status}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const articles = data?.articles ?? data?.news ?? data?.results ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return articles.slice(0, count).map((r: any) => ({ title: r.title, url: r.url, snippet: r.description ?? r.summary }));
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Keyless. Response shape confirmed live: {"pages":[{id,key,title,excerpt,description,
   * thumbnail},...]}. `key` is the URL slug (e.g. "Marcus_Aurelius"); `excerpt` carries
   * <span class="searchmatch"> highlight tags that get stripped for a clean snippet. Wikimedia
   * policy requires a descriptive User-Agent identifying the app (not an API key) for anonymous
   * access at the 200 req/min tier instead of 10 req/min with none.
   */
  private async callWikipedia(query: string, count: number): Promise<SearchResultItem[]> {
    const url = `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(query)}&limit=${count}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'ProjectAtlas/1.0 (https://github.com/prakash1886/project-atlas)' } });
    if (!res.ok) throw new Error(`Wikipedia API responded with status ${res.status}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data?.pages ?? []).map((r: any) => ({
      title: r.title,
      url: `https://en.wikipedia.org/wiki/${r.key}`,
      snippet: r.description ?? (typeof r.excerpt === 'string' ? r.excerpt.replace(/<\/?span[^>]*>/g, '') : undefined),
    }));
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
    return Math.floor(c.freeCap * c.safetyMargin);
  }

  private monthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private dayStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  /**
   * Reserve one unit of this provider's quota, scoped to its real cap period (monthly for
   * brave/exa, daily for currents/freenews -- see ProviderLimits.capPeriod). Atomic via Redis
   * INCR (reserve-before-call so concurrent agents can't collectively overshoot). FAILS CLOSED —
   * if neither Redis nor the ledger can confirm we're under cap, deny the call rather than risk
   * paid overage.
   */
  private async reserveQuota(source: SearchSource): Promise<boolean> {
    const cfg = PROVIDERS[source];
    if (cfg.allowPaidOverage) return true; // explicitly opted into paid usage
    if (cfg.capPeriod === 'none') return true; // no quota-exhaustion concept (e.g. Wikipedia) — only underRateLimit applies
    const cap = this.effectiveCap(source);
    const isDaily = cfg.capPeriod === 'daily';
    const bucket = isDaily ? new Date().toISOString().slice(0, 10) : new Date().toISOString().slice(0, 7); // YYYY-MM-DD or YYYY-MM
    const ttlSeconds = isDaily ? 60 * 60 * 26 : 60 * 60 * 24 * 40; // ~26h or ~40d — outlives the bucket, never accumulates

    // Preferred: atomic Redis counter
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = this.redis as any;
      if (r && typeof r.incr === 'function') {
        const k = `apiquota:${source}:${bucket}`;
        const n: number = await r.incr(k);
        if (n === 1 && typeof r.expire === 'function') await r.expire(k, ttlSeconds);
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

    // Fallback: count this period's ledger. Less atomic, but fail-closed on error (cost > availability).
    try {
      const since = isDaily ? this.dayStart() : this.monthStart();
      const res = await this.db.query(
        `SELECT COALESCE(SUM(request_count), 0) AS used FROM api_usage_ledger WHERE provider = $1 AND day >= $2`,
        [source, since],
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
