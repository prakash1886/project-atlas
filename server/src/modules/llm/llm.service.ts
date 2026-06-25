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
      return `Mocked Gemma 4 26B-A4B Output for: "${prompt.substring(0, 30)}..."`;
    }

    try {
      const messages: { role: 'system' | 'user'; content: string }[] = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await this.openai.chat.completions.create({
        model: 'google/gemma-4-26B-A4B-it',  // served by Modal A10G vLLM proxy
        messages,
        temperature: 0.2,
      });

      return response.choices[0]?.message?.content || '';
    } catch (e) {
      this.logger.error(`[LlmService] Error querying Modal GPU: ${e}`);
      throw e;
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.openai) {
      this.logger.warn('[LlmService] (Mocked) Generating embeddings...');
      return texts.map(() => Array.from({ length: 300 }, () => Math.random()));
    }

    try {
      this.logger.log(`[LlmService] Querying Modal GPU for embeddings of ${texts.length} inputs`);
      const response = await this.openai.embeddings.create({
        model: 'google/embeddinggemma-300m',
        input: texts,
      });

      return response.data.map((d) => d.embedding);
    } catch (e) {
      this.logger.error(`[LlmService] Error generating embeddings: ${e}`);
      throw e;
    }
  }

  async generateImage(prompt: string): Promise<string> {
    this.logger.log(`[LlmService] Generating image via Stable Diffusion / Flux for: "${prompt}"`);
    // Mock S3 target return
    return 'https://s3.amazonaws.com/atlas-assets/mockups/generated_thumbnail.jpg';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async runDataScienceInsight(insightType: string, data: any): Promise<any> {
    const baseURL = process.env.DSSTAR_API_URL || process.env.MODAL_LLM_URL;
    const apiKey = process.env.DSSTAR_API_KEY || process.env.MODAL_API_KEY;

    if (!baseURL) {
      this.logger.warn(`[LlmService] (Mocked) Running DS-STAR task: ${insightType}`);
      const timestamp = new Date().toISOString();

      if (insightType === 'forecast-retention') {
        return {
          video_id: data.video_id || 'mock-video-id',
          predicted_drop_offs: [{ at_index: 3, drop_percentage: 12.5 }],
          overall_retention_trend: 'stable',
        };
      } else if (insightType === 'optimize-weights') {
        return {
          optimized_weights: {
            search: 0.22,
            discussion: 0.14,
            video: 0.14,
            evergreen: 0.17,
            emotion: 0.12,
            competition: 0.09,
            monetization: 0.08,
            regional: 0.04,
          },
          learning_rate: 0.01,
          status: 'weights_converged',
        };
      } else if (insightType === 'content-opportunity') {
        return {
          generated_at: timestamp,
          top_opportunities: [
            {
              topic: 'Psychology of Rivalry: Messi vs Ronaldo',
              search_growth_score: 92,
              discussion_intensity_score: 88,
              virality_score: 95,
              monetization_score: 85,
              evergreen_score: 75,
              composite_score: 88.5,
              reasons: ['High search growth driven by upcoming matches', 'Intense debate on Reddit', 'High sponsorship CTR for sports psychology'],
            },
            {
              topic: 'The Stoic Mindset of Marcus Aurelius',
              search_growth_score: 80,
              discussion_intensity_score: 75,
              virality_score: 70,
              monetization_score: 90,
              evergreen_score: 98,
              composite_score: 82.6,
              reasons: ['Extremely high evergreen value', 'Proven retention on philosophical topics', 'Appeals to high-income entrepreneur demographic'],
            }
          ],
          merchandise_opportunities: ['Stoic Quote Shirts', 'Rivalry Poster Series'],
          audience_opportunities: ['Q&A segment on sport psychology vs daily motivation'],
          forecasted_trends: ['Stoicism in tech hubs', 'Rivalry psychology videos'],
        };
      } else if (insightType === 'audience-analysis') {
        return {
          channel_id: data.data_files?.[0]?.split('_')?.[0] || 'mock-channel',
          generated_at: timestamp,
          primary_persona: {
            segment_name: 'The Analytical Improver',
            age_range: '18-34',
            top_regions: ['United States', 'India', 'United Kingdom'],
            content_preferences: ['Case studies', 'Psychological breakdown', 'Historical deep-dives'],
            watch_behaviour: 'Watches 70% of video on desktop, high completion rate on 15-20 min formats',
            emotional_triggers: ['Curiosity', 'Sense of revelation', 'Underdog sympathy'],
            share_propensity: 'high',
          },
          secondary_personas: [
            {
              segment_name: 'Casual Science Enthusiast',
              age_range: '13-24',
              top_regions: ['India', 'Brazil', 'Indonesia'],
              content_preferences: ['Short hook summaries', 'Visual animations', 'Trivia'],
              watch_behaviour: '75% mobile, watches first 5 minutes then drops off',
              emotional_triggers: ['Surprise', 'Awe'],
              share_propensity: 'medium',
            }
          ],
          geographic_breakdown: { 'US': 0.45, 'IN': 0.30, 'GB': 0.15, 'Others': 0.10 },
          retention_insights: ['Viewer drop-off at intro hooks exceeds 30% on mobile', 'Desktop viewers stay for complex mid-video explanations'],
        };
      } else if (insightType === 'story-universe') {
        return {
          personality_id: data.data_files?.[0]?.split('_')?.[0] || 'mock-personality',
          generated_at: timestamp,
          ranked_story_types: [
            { story_type: 'comeback_story', avg_retention_pct: 64.5, avg_watch_time_minutes: 12.8, sample_size: 5, top_performing_video_id: 'v123' },
            { story_type: 'rivalry_story', avg_retention_pct: 58.2, avg_watch_time_minutes: 10.5, sample_size: 8, top_performing_video_id: 'v456' },
            { story_type: 'origin_story', avg_retention_pct: 52.1, avg_watch_time_minutes: 9.2, sample_size: 12, top_performing_video_id: 'v789' }
          ],
          recommended_next_story_type: 'comeback_story',
          recommendation_reason: 'Comeback stories for this personality show a 12% higher retention in the first 2 minutes, driven by strong emotional hook points.',
        };
      } else if (insightType === 'archetype-analysis') {
        return {
          generated_at: timestamp,
          archetype_performance: [
            { archetype: 'underdog', avg_watch_time_minutes: 14.2, avg_retention_pct: 62.0, share_rate: 0.08, comment_engagement_rate: 0.12, subscriber_conversion_rate: 0.04, video_count: 6 },
            { archetype: 'rebel', avg_watch_time_minutes: 11.5, avg_retention_pct: 55.4, share_rate: 0.14, comment_engagement_rate: 0.18, subscriber_conversion_rate: 0.05, video_count: 4 },
            { archetype: 'visionary', avg_watch_time_minutes: 15.0, avg_retention_pct: 59.8, share_rate: 0.09, comment_engagement_rate: 0.10, subscriber_conversion_rate: 0.03, video_count: 5 }
          ],
          best_for_retention: 'underdog',
          best_for_shares: 'rebel',
          best_for_watch_time: 'visionary',
          production_recommendations: ['Script the next 3 videos using the Rebel archetype to drive high virality/shares', 'Maintain Underdog framing to protect long-form watch time'],
        };
      } else if (insightType === 'geographic-intelligence') {
        return {
          channel_id: data.data_files?.[0]?.split('_')?.[0] || 'mock-channel',
          generated_at: timestamp,
          top_regions: [
            { region: 'United States', country_code: 'US', watch_time_pct: 42.5, top_content_categories: ['Corporate Rivalries', 'Space Race'], cultural_hooks: ['American Dream', 'Rebellion against systems'], opportunity_score: 85 },
            { region: 'India', country_code: 'IN', watch_time_pct: 35.0, top_content_categories: ['Cricket Legends', 'Tech Startups'], cultural_hooks: ['Cricket psychology', 'Jugaad innovation', 'National pride'], opportunity_score: 95 }
          ],
          regional_topic_opportunities: {
            'IN': ['The Mindset of MS Dhoni under Pressure', 'How UPI Changed Indian Commerce'],
            'US': ['The Rise and Fall of WeWork: Archetype Analysis']
          },
          backlog_priority_adjustments: { 'dhoni-mindset': 15, 'wework-fall': 5 },
        };
      } else if (insightType === 'hidden-legends-discovery') {
        return {
          generated_at: timestamp,
          discoveries: [
            {
              name: 'Arthur Saint-Leon',
              domain: 'Performing Arts / Ballet History',
              story_quality_score: 94,
              coverage_gap_score: 88,
              wikipedia_pageview_growth_pct: 28.5,
              existing_best_video_views: 45000,
              opportunity_score: 91.2,
              story_angles: ['The creator of Coppelia who died of exhaustion/heartbreak', 'His fierce rivalry with Marius Petipa'],
              sources: ['Wikipedia:Arthur_Saint-Leon', 'French Ballet Archives'],
            },
            {
              name: 'Dr. Gladys West',
              domain: 'Mathematics / Space History',
              story_quality_score: 89,
              coverage_gap_score: 75,
              wikipedia_pageview_growth_pct: 32.0,
              existing_best_video_views: 120000,
              opportunity_score: 85.4,
              story_angles: ['The hidden figure who programmed the calculations for GPS', 'Overcoming Jim Crow South to build modern mapping'],
              sources: ['Wikipedia:Gladys_West', 'NASA history records'],
            }
          ],
          total_scanned: 142,
          filter_criteria: ['Wikipedia traffic > 20%', 'Best YouTube video < 500K views', 'High narrative potential'],
        };
      } else if (insightType === 'youtube-format-analysis') {
        return {
          channel_id: data.data_files?.[0]?.split('_')?.[0] || 'mock-channel',
          generated_at: timestamp,
          optimal_video_length_by_topic: { 'History': 18.5, 'Psychology': 22.0, 'Business': 15.0 },
          best_hook_duration_seconds: 14.5,
          best_publish_times: [{ day: 'Sunday', hour_utc: 15 }, { day: 'Thursday', hour_utc: 18 }],
          chapter_structure_recommendations: ['Introduce case study conflict within first 30s', 'Inject a mini-resolution at 8-minute mark to reset retention curve'],
          insights: [
            { metric: 'Hook retention', finding: 'Adding visual text animations in the first 10 seconds reduces hook drop-off by 15%', confidence: 'high', recommendation: 'Enforce kinetic text overlays in editing templates' }
          ],
        };
      } else if (insightType === 'backlog-ranking') {
        return {
          generated_at: timestamp,
          create_now: [
            { personality_id: 'ms-dhoni', name: 'MS Dhoni', composite_score: 94.2, trend_score: 98, story_quality_score: 92, geographic_demand_score: 96, audience_fit_score: 90, competition_gap_score: 95, recommended_story_type: 'comeback_story', recommended_archetype: 'underdog' },
            { personality_id: 'gladys-west', name: 'Dr. Gladys West', composite_score: 89.5, trend_score: 82, story_quality_score: 95, geographic_demand_score: 85, audience_fit_score: 92, competition_gap_score: 98, recommended_story_type: 'origin_story', recommended_archetype: 'visionary' }
          ],
          create_later: [
            { personality_id: 'marcus-aurelius', name: 'Marcus Aurelius', composite_score: 81.2, trend_score: 75, story_quality_score: 88, geographic_demand_score: 78, audience_fit_score: 85, competition_gap_score: 80 }
          ],
          archive: [
            { personality_id: 'random-celeb', name: 'Overexposed Celebrity', composite_score: 34.0, trend_score: 40, story_quality_score: 30, geographic_demand_score: 35, audience_fit_score: 30, competition_gap_score: 35 }
          ],
          scoring_weights: { trend: 0.25, story_quality: 0.25, geographic_demand: 0.20, audience_fit: 0.15, competition_gap: 0.15 },
        };
      }
      return { status: 'mocked_success', data };
    }

    try {
      this.logger.log(`[LlmService] Triggering DS-STAR ${insightType} analyst endpoint...`);
      const url = `${baseURL}/v1/ds-star/${insightType}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (e) {
      this.logger.error(`[LlmService] Error querying DS-STAR endpoint ${insightType}: ${e}`);
      throw e;
    }
  }
}
