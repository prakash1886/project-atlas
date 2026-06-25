import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Inject } from '@nestjs/common';
import type { Pool } from 'pg';
import { HeyGenService } from './heygen.service.js';
import { HiggsfieldService } from './higgsfield.service.js';

@Controller('api/video')
export class VideoController {
  private readonly logger = new Logger(VideoController.name);

  constructor(
    @Inject('DATABASE_POOL')
    private readonly db: Pool,
    private readonly heyGenService: HeyGenService,
    private readonly higgsfieldService: HiggsfieldService
  ) {}

  /**
   * HeyGen webhook callback receiver.
   * Handles status updates for virtual host narration videos.
   */
  @Post('heygen-callback')
  @HttpCode(HttpStatus.OK)
  async handleHeyGenCallback(@Body() body: any) {
    this.logger.log(`[VideoController] Received HeyGen webhook: ${JSON.stringify(body)}`);

    // Normalize webhook formats
    const event = body?.event;
    const data = body?.data || {};
    const videoId = data.video_id || body?.video_id || body?.videoId;
    const status = data.status || body?.status;
    const url = data.url || body?.url || data.video_url;
    const error = data.error || body?.error;

    this.logger.log(
      `[VideoController] HeyGen status update: videoId=${videoId}, status=${status}, event=${event}`
    );

    // If completed, update status in envato_asset_references if applicable
    if (status === 'completed' && videoId && url) {
      try {
        await this.db.query(
          `UPDATE envato_asset_references 
           SET incorporated_description = $1 
           WHERE envato_item_id = $2 AND item_type = 'heygen_avatar'`,
          [`HeyGen avatar video generated successfully. URL: ${url}`, videoId]
        );
      } catch (err: any) {
        this.logger.warn(`[VideoController] Failed to update asset references for HeyGen: ${err.message}`);
      }
    }

    return {
      status: 'success',
      received: true,
      videoId,
      state: status,
    };
  }

  /**
   * Higgsfield webhook callback receiver.
   * Handles status updates for Kling, Sora, Veo, etc., generation clips.
   */
  @Post('higgsfield-callback')
  @HttpCode(HttpStatus.OK)
  async handleHiggsfieldCallback(@Body() body: any) {
    this.logger.log(`[VideoController] Received Higgsfield webhook: ${JSON.stringify(body)}`);

    const jobId = body?.jobId || body?.job_id;
    const status = body?.status;
    const url = body?.url;
    const error = body?.error;

    this.logger.log(
      `[VideoController] Higgsfield status update: jobId=${jobId}, status=${status}, error=${error}`
    );

    // If completed, update status in envato_asset_references if applicable
    if (status === 'completed' && jobId && url) {
      try {
        await this.db.query(
          `UPDATE envato_asset_references 
           SET incorporated_description = $1 
           WHERE envato_item_id = $2 AND item_type = 'higgsfield_clip'`,
          [`Higgsfield B-roll clip generated successfully. URL: ${url}`, jobId]
        );
      } catch (err: any) {
        this.logger.warn(`[VideoController] Failed to update asset references for Higgsfield: ${err.message}`);
      }
    }

    return {
      status: 'success',
      received: true,
      jobId,
      state: status,
    };
  }
}
