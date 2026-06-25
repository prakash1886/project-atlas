import { Injectable, Logger } from '@nestjs/common';

export interface HeyGenScene {
  avatarId: string;
  voiceId: string;
  scriptText: string;
  backgroundUrl?: string; // Sourced from Envato Elements
  textOverlays?: Array<{ text: string; x: number; y: number }>;
}

@Injectable()
export class HeyGenService {
  private readonly logger = new Logger(HeyGenService.name);
  private readonly apiKey = process.env.HEYGEN_API_KEY;

  constructor() {
    if (this.apiKey) {
      this.logger.log('[HeyGenService] HeyGen API client initialized.');
    } else {
      this.logger.warn('[HeyGenService] HEYGEN_API_KEY is not configured. Running in offline/stub mode.');
    }
  }

  /**
   * Generates a video from a pre-defined HeyGen Template by swapping out variables (such as backgrounds, text, and voice scripts).
   */
  async generateVideoFromTemplate(
    templateId: string,
    variables: Record<string, any>,
    options?: { testMode?: boolean }
  ): Promise<Record<string, unknown>> {
    if (!this.apiKey) {
      this.logger.warn(`[HeyGenService] Stub: Generating template video for template ID: ${templateId}`);
      return {
        videoId: `heygen-template-${Math.random().toString(36).substring(2, 10)}`,
        status: 'pending',
        templateId,
        variables,
      };
    }

    try {
      const response = await fetch(`https://api.heygen.com/v2/template/${templateId}/generate`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caption: options?.testMode ? false : true,
          variables,
          test_mode: options?.testMode || false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HeyGen Template API responded with status ${response.status}`);
      }

      const data = await response.json();
      return data?.data ?? data;
    } catch (e: any) {
      this.logger.error(`[HeyGenService] Error generating video from template: ${e.message}`);
      throw e;
    }
  }

  /**
   * Generates a multi-scene video dynamically using the HeyGen Studio API.
   * Maps stock background URLs (from Envato) and narrative scripts to HeyGen scenes.
   */
  async generateVideoFromScenes(
    scenes: HeyGenScene[],
    options?: { backgroundMusicUrl?: string; callbackUrl?: string }
  ): Promise<Record<string, unknown>> {
    const payload = {
      video_inputs: scenes.map((s, index) => ({
        character: {
          type: 'avatar',
          avatar_id: s.avatarId,
          avatar_style: 'normal',
        },
        voice: {
          type: 'text',
          voice_id: s.voiceId,
          input_text: s.scriptText,
        },
        background: s.backgroundUrl
          ? {
              type: s.backgroundUrl.endsWith('.mp4') ? 'video' : 'image',
              url: s.backgroundUrl,
            }
          : {
              type: 'color',
              value: '#1e1e2e',
            },
        // Timed subtitles/captions
        caption: true,
      })),
      dimension: {
        width: 1920,
        height: 1080,
      },
      callback_url: options?.callbackUrl || 'https://api.projectatlas.io/api/video/heygen-callback',
    };

    if (!this.apiKey) {
      this.logger.warn(`[HeyGenService] Stub: Submitting Studio video generation with ${scenes.length} scenes.`);
      return {
        videoId: `heygen-studio-${Math.random().toString(36).substring(2, 10)}`,
        status: 'pending',
        scenesCount: scenes.length,
      };
    }

    try {
      const response = await fetch('https://api.heygen.com/v2/video/generate', {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HeyGen Studio API responded with status ${response.status}`);
      }

      const data = await response.json();
      return data?.data ?? data;
    } catch (e: any) {
      this.logger.error(`[HeyGenService] Error generating video from scenes: ${e.message}`);
      throw e;
    }
  }

  /**
   * Retrieves status of an asynchronous video rendering task.
   */
  async getJobStatus(videoId: string): Promise<Record<string, unknown>> {
    if (!this.apiKey) {
      this.logger.warn(`[HeyGenService] Stub: Checking status for job ID: ${videoId}`);
      return {
        videoId,
        status: 'completed',
        url: 'https://assets.heygen.com/renders/mock-heygen-output.mp4',
        progress: 100,
      };
    }

    try {
      const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        headers: {
          'X-Api-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`HeyGen Job Status API responded with status ${response.status}`);
      }

      const data = await response.json();
      return data?.data ?? data;
    } catch (e: any) {
      this.logger.error(`[HeyGenService] Error checking job status: ${e.message}`);
      throw e;
    }
  }
}
