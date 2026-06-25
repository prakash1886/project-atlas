import { Injectable, Logger } from '@nestjs/common';

export interface HiggsfieldGenerationOptions {
  model?: string; // 'kling-3.0' | 'sora-2' | 'veo' | 'seedream' etc.
  resolution?: '1080p' | '720p' | '4k';
  duration?: number; // in seconds
  characterId?: string; // For "Soul" character consistency training
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

@Injectable()
export class HiggsfieldService {
  private readonly logger = new Logger(HiggsfieldService.name);
  private readonly apiKey = process.env.HIGGSFIELD_API_KEY;

  constructor() {
    if (this.apiKey) {
      this.logger.log('[HiggsfieldService] Higgsfield API client initialized.');
    } else {
      this.logger.warn('[HiggsfieldService] HIGGSFIELD_API_KEY is not configured. Running in offline/stub mode.');
    }
  }

  /**
   * Submits a text-to-video generation job to Higgsfield AI, which forwards it to the selected frontier model.
   */
  async generateVideo(
    prompt: string,
    options?: HiggsfieldGenerationOptions
  ): Promise<Record<string, unknown>> {
    const chosenModel = options?.model || 'kling-3.0';
    const resolution = options?.resolution || '1080p';
    const duration = options?.duration || 5;
    const aspectRatio = options?.aspectRatio || '16:9';

    if (!this.apiKey) {
      this.logger.warn(`[HiggsfieldService] Stub: Submitting video generation to Higgsfield using model: "${chosenModel}"`);
      return {
        jobId: `higgsfield-job-${Math.random().toString(36).substring(2, 10)}`,
        status: 'queued',
        model: chosenModel,
        prompt,
        aspectRatio,
        duration,
        resolution,
      };
    }

    try {
      const response = await fetch('https://api.higgsfield.ai/v2/video/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: chosenModel,
          resolution,
          duration,
          aspect_ratio: aspectRatio,
          character_id: options?.characterId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Higgsfield API responded with status ${response.status}`);
      }

      const data = await response.json();
      return data?.data ?? data;
    } catch (e: any) {
      this.logger.error(`[HiggsfieldService] Error submitting Higgsfield generation: ${e.message}`);
      throw e;
    }
  }

  /**
   * Retrieves status of an asynchronous video generation task.
   */
  async getJobStatus(jobId: string): Promise<Record<string, unknown>> {
    if (!this.apiKey) {
      this.logger.warn(`[HiggsfieldService] Stub: Checking Higgsfield job status: ${jobId}`);
      return {
        jobId,
        status: 'completed',
        url: 'https://assets.higgsfield.ai/renders/mock-higgsfield-clip.mp4',
        progress: 100,
      };
    }

    try {
      const response = await fetch(`https://api.higgsfield.ai/v2/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Higgsfield Job Status API responded with status ${response.status}`);
      }

      const data = await response.json();
      return data?.data ?? data;
    } catch (e: any) {
      this.logger.error(`[HiggsfieldService] Error checking Higgsfield job status: ${e.message}`);
      throw e;
    }
  }
}
