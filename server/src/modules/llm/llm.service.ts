import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private openai: OpenAI | null = null;

  constructor() {
    const baseURL = process.env.MODAL_LLM_URL;
    const apiKey = process.env.MODAL_API_KEY;

    if (baseURL && apiKey) {
      this.logger.log(`[LlmService] Initializing OpenAI-compatible client for Modal GPU at ${baseURL}`);
      this.openai = new OpenAI({
        baseURL,
        apiKey,
      });
    } else {
      this.logger.warn(
        '[LlmService] MODAL_LLM_URL or MODAL_API_KEY not configured. Falling back to mocked responses.'
      );
    }
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.openai) {
      this.logger.warn('[LlmService] (Mocked) Generating text response...');
      return `Mocked Gemma 4 Output for: "${prompt.substring(0, 30)}..."`;
    }

    try {
      const messages: { role: 'system' | 'user'; content: string }[] = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await this.openai.chat.completions.create({
        model: 'gemma-4-12b',
        messages,
        temperature: 0.2,
      });

      return response.choices[0]?.message?.content || '';
    } catch (e) {
      this.logger.error(`[LlmService] Error querying Modal GPU: ${e}`);
      throw e;
    }
  }

  async generateImage(prompt: string): Promise<string> {
    this.logger.log(`[LlmService] Generating image via DiffusionGemma for: "${prompt}"`);
    // Mock S3 target return
    return 'https://s3.amazonaws.com/atlas-assets/mockups/generated_thumbnail.jpg';
  }
}
