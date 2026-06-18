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
}
