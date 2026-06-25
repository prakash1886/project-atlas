import { Injectable, Logger, Inject } from '@nestjs/common';
import type { Redis } from 'ioredis';

export interface GoogleLyriaGenerationOptions {
  durationSeconds?: number;
  model?: 'lyria-3-pro-preview' | 'lyria-3-clip-preview';
}

@Injectable()
export class GoogleLyriaService {
  private readonly logger = new Logger(GoogleLyriaService.name);
  private readonly apiKey = process.env.GEMINI_API_KEY;
  private memoryTracker?: { date: string; count: number };

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis
  ) {
    if (this.apiKey) {
      this.logger.log('[GoogleLyriaService] Google Lyria API client initialized (via GEMINI_API_KEY).');
    } else {
      this.logger.warn('[GoogleLyriaService] GEMINI_API_KEY is not configured. Running in offline/stub mode.');
    }
  }

  /**
   * Generates a background music track based on the prompt.
   * Enforces a strict limit of 50 tracks per day.
   */
  async generateMusic(
    prompt: string,
    options?: GoogleLyriaGenerationOptions
  ): Promise<Record<string, unknown>> {
    const duration = options?.durationSeconds || 30;
    const model = options?.model || 'lyria-3-pro-preview';

    // 1. Enforce 50 tracks/day limit
    const allowed = await this.checkAndIncrementLimit();
    if (!allowed) {
      throw new Error('Google Lyria generation limit reached for today (max 50 tracks).');
    }

    if (!this.apiKey) {
      this.logger.warn(`[GoogleLyriaService] Stub: Submitting music generation to Google Lyria: "${prompt}" using model: "${model}"`);
      return {
        jobId: `lyria-job-${Math.random().toString(36).substring(2, 10)}`,
        status: 'queued',
        model,
        prompt,
        durationSeconds: duration,
      };
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1alpha/models/${model}:generateAudio?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          audioConfig: {
            durationSeconds: duration,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Google Lyria API responded with status ${response.status}`);
      }

      const data = await response.json();
      return data?.data ?? data;
    } catch (e: any) {
      this.logger.error(`[GoogleLyriaService] Error generating Google Lyria music: ${e.message}`);
      throw e;
    }
  }

  /**
   * Retrieves status of an active Google Lyria generation task.
   */
  async getJobStatus(jobId: string): Promise<Record<string, unknown>> {
    if (!this.apiKey) {
      this.logger.warn(`[GoogleLyriaService] Stub: Checking Google Lyria job status: ${jobId}`);
      return {
        jobId,
        status: 'completed',
        url: 'https://assets.google.com/lyria/renders/mock-lyria-track.mp3',
        progress: 100,
      };
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1alpha/operations/${jobId}?key=${this.apiKey}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Google Lyria Job Status API responded with status ${response.status}`);
      }

      const data = await response.json();
      return data?.data ?? data;
    } catch (e: any) {
      this.logger.error(`[GoogleLyriaService] Error checking Google Lyria job status: ${e.message}`);
      throw e;
    }
  }

  /**
   * Checks and increments the daily generation count.
   * Returns true if allowed, false if limit reached.
   */
  private async checkAndIncrementLimit(): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const key = `google-lyria:daily-count:${today}`;

    if (this.redis && typeof this.redis.incr === 'function') {
      try {
        const countStr = await this.redis.get(key);
        const count = countStr ? parseInt(countStr, 10) : 0;
        if (count >= 50) {
          this.logger.error(`[GoogleLyriaService] Daily generation limit of 50 tracks reached.`);
          return false;
        }
        await this.redis.incr(key);
        await this.redis.expire(key, 172800); // 48 hours expiration
        return true;
      } catch (err: any) {
        this.logger.warn(`[GoogleLyriaService] Redis failed to track limit, falling back to memory: ${err.message}`);
      }
    }

    // Memory fallback
    if (!this.memoryTracker) {
      this.memoryTracker = { date: today, count: 0 };
    } else if (this.memoryTracker.date !== today) {
      this.memoryTracker = { date: today, count: 0 };
    }

    if (this.memoryTracker.count >= 50) {
      this.logger.error(`[GoogleLyriaService] Daily generation limit of 50 tracks reached (memory tracker).`);
      return false;
    }

    this.memoryTracker.count++;
    return true;
  }
}
