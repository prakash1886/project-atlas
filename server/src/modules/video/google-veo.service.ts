import { Injectable, Logger } from '@nestjs/common';

export interface GoogleVeoGenerationOptions {
  aspectRatio?: '16:9' | '9:16' | '1:1';
  durationSeconds?: 5 | 6; // Veo preview generates 5-6s clips
  resolution?: '720p' | '1080p';
}

@Injectable()
export class GoogleVeoService {
  private readonly logger = new Logger(GoogleVeoService.name);
  private readonly apiKey = process.env.GEMINI_API_KEY;

  constructor() {
    if (this.apiKey) {
      this.logger.log('[GoogleVeoService] Google Veo API client initialized (via GEMINI_API_KEY).');
    } else {
      this.logger.warn('[GoogleVeoService] GEMINI_API_KEY is not configured. Running in offline/stub mode.');
    }
  }

  /**
   * Submits a video generation request to the Google Veo model via the Gemini/Vertex GenAI endpoint.
   */
  async generateVideo(
    prompt: string,
    options?: GoogleVeoGenerationOptions
  ): Promise<Record<string, unknown>> {
    const aspectRatio = options?.aspectRatio || '16:9';
    const duration = options?.durationSeconds || 5;
    const resolution = options?.resolution || '720p';

    if (!this.apiKey) {
      this.logger.warn(`[GoogleVeoService] Stub: Submitting video generation to Google Veo: "${prompt}"`);
      return {
        jobId: `veo-job-${Math.random().toString(36).substring(2, 10)}`,
        status: 'queued',
        model: 'veo-3.1-generate-preview',
        prompt,
        aspectRatio,
        duration,
        resolution,
      };
    }

    try {
      // Endpoint for Google Veo generation via Google GenAI API
      const url = `https://generativelanguage.googleapis.com/v1alpha/models/veo-3.1-generate-preview:generateVideo?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          videoConfig: {
            aspectRatio,
            durationSeconds: duration,
            resolution,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Google Veo API responded with status ${response.status}`);
      }

      const data = await response.json();
      return data?.data ?? data;
    } catch (e: any) {
      this.logger.error(`[GoogleVeoService] Error generating Google Veo video: ${e.message}`);
      throw e;
    }
  }

  /**
   * Retrieves status of an active Google Veo generation task.
   */
  async getJobStatus(jobId: string): Promise<Record<string, unknown>> {
    if (!this.apiKey) {
      this.logger.warn(`[GoogleVeoService] Stub: Checking Google Veo job status: ${jobId}`);
      return {
        jobId,
        status: 'completed',
        url: 'https://assets.google.com/veo/renders/mock-veo-clip.mp4',
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
        throw new Error(`Google Veo Job Status API responded with status ${response.status}`);
      }

      const data = await response.json();
      return data?.data ?? data;
    } catch (e: any) {
      this.logger.error(`[GoogleVeoService] Error checking Google Veo job status: ${e.message}`);
      throw e;
    }
  }
}
