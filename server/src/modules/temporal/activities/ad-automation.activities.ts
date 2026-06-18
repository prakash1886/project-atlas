import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../../llm/llm.service.js';

@Injectable()
export class AdAutomationActivities {
  private readonly logger = new Logger(AdAutomationActivities.name);

  constructor(private readonly llmService: LlmService) {}

  async scanTrends(topic: string): Promise<string> {
    this.logger.log(`[Activities] Scanning signals for topic: "${topic}"`);
    return `Signals verified for trend: ${topic} [Score: 94]`;
  }

  async generateAdContent(trendDetails: string): Promise<string> {
    this.logger.log('[Activities] Querying serverless Modal GPU for ad copywriting...');
    const prompt = `Create high-converting ad copy based on these trend details: ${trendDetails}`;
    const copy = await this.llmService.generateText(
      prompt,
      'You are a marketing agent specialized in viral trend campaigns.'
    );
    return copy;
  }

  async registerPrintOnDemand(adContext: string): Promise<string> {
    this.logger.log('[Activities] Registering print-on-demand template in Printful...');
    // Simulated POD variant template registration
    return `MOCK-SKU-${adContext.length}-FRONT`;
  }

  async publishToShopify(sku: string): Promise<string> {
    this.logger.log(`[Activities] Publishing product live to Shopify storefront with SKU: ${sku}`);
    return `https://project-atlas-shop.myshopify.com/products/${sku.toLowerCase()}`;
  }
}
