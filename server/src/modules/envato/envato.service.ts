import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EnvatoService {
  private readonly logger = new Logger(EnvatoService.name);
  private readonly apiToken = process.env.ENVATO_API_TOKEN;

  constructor() {
    if (this.apiToken) {
      this.logger.log('[EnvatoService] Envato API client initialized.');
    } else {
      this.logger.warn('[EnvatoService] ENVATO_API_TOKEN is not configured. Running in offline/stub mode.');
    }
  }

  async verifyPurchase(purchaseCode: string): Promise<Record<string, unknown>> {
    if (!this.apiToken) {
      this.logger.warn(`[EnvatoService] Stub: Verifying purchase code: ${purchaseCode}`);
      return {
        valid: true,
        buyer: 'project-atlas-developer',
        item: {
          id: '12345678',
          name: 'Premium Vector Assets - Campaign Overlays',
        },
      };
    }

    try {
      const response = await fetch(`https://api.envato.com/v3/market/author/sale?code=${purchaseCode}`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Envato API responded with status ${response.status}`);
      }

      return await response.json();
    } catch (e) {
      this.logger.error(`[EnvatoService] Error checking purchase: ${e}`);
      throw e;
    }
  }

  async searchCatalog(query: string, category?: string): Promise<Record<string, unknown>[]> {
    if (!this.apiToken) {
      this.logger.warn(`[EnvatoService] Stub: Searching catalog for query: ${query} (category: ${category})`);
      return [
        {
          id: '87654321',
          name: `Background Music - ${query}`,
          category: category || 'audio',
          url: 'https://elements.envato.com/audio/mock-track',
          license: 'ELEMENTS-MOCK-LICENSE-123',
        },
      ];
    }

    try {
      const url = `https://api.envato.com/v1/market/search/it.json?term=${encodeURIComponent(query)}${
        category ? `&category=${encodeURIComponent(category)}` : ''
      }`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Envato API responded with status ${response.status}`);
      }

      const data = await response.json();
      return data.matches || [];
    } catch (e) {
      this.logger.error(`[EnvatoService] Error searching Envato catalog: ${e}`);
      throw e;
    }
  }

  /**
   * Generates a video clip using Envato VideoGen AI based on a prompt.
   */
  async generateVideoClip(
    prompt: string,
    options?: { duration?: number; aspect_ratio?: string }
  ): Promise<Record<string, unknown>> {
    if (!this.apiToken) {
      this.logger.warn(`[EnvatoService] Stub: Generating VideoGen clip for prompt: "${prompt}"`);
      return {
        clipId: `videogen-${Math.random().toString(36).substring(2, 10)}`,
        prompt,
        status: 'completed',
        url: 'https://elements.envato.com/video/mock-videogen-output.mp4',
        duration: options?.duration || 5,
        aspect_ratio: options?.aspect_ratio || '16:9',
      };
    }

    try {
      const response = await fetch('https://api.envato.com/v1/videogen/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          duration: options?.duration || 5,
          aspect_ratio: options?.aspect_ratio || '16:9',
        }),
      });

      if (!response.ok) {
        throw new Error(`Envato VideoGen API responded with status ${response.status}`);
      }

      return await response.json();
    } catch (e: any) {
      this.logger.error(`[EnvatoService] Error generating VideoGen clip: ${e.message}`);
      throw e;
    }
  }

  /**
   * Registers usage of an Envato Elements asset for a specific project/video to comply with license terms.
   */
  async registerAssetLicense(itemId: string, projectName: string): Promise<Record<string, unknown>> {
    if (!this.apiToken) {
      this.logger.warn(`[EnvatoService] Stub: Registering license for item ${itemId} under project "${projectName}"`);
      return {
        registrationId: `license-reg-${Math.random().toString(36).substring(2, 10)}`,
        itemId,
        projectName,
        status: 'registered',
        licenseKey: `ELEMENTS-MOCK-LICENSE-${itemId}-${Date.now()}`,
      };
    }

    try {
      const response = await fetch('https://api.envato.com/v1/user/download', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId,
          project_name: projectName,
          app_name: 'Project Atlas Content Engine',
        }),
      });

      if (!response.ok) {
        throw new Error(`Envato Elements license registration responded with status ${response.status}`);
      }

      return await response.json();
    } catch (e: any) {
      this.logger.error(`[EnvatoService] Error registering Envato Elements asset license: ${e.message}`);
      throw e;
    }
  }
}
