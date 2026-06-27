import { Controller, Get, Post, Body, Param, Inject, Logger, UseGuards, BadRequestException } from '@nestjs/common';
import type { Pool } from 'pg';
import type { Client } from '@temporalio/client';
import { editorialVoteSignal, type EditorialVote } from '../temporal/workflows/editorial-review.workflow.js';
import { ReviewAuthGuard } from './review-auth.guard.js';

@Controller('api/reviews')
@UseGuards(ReviewAuthGuard)
export class ReviewController {
  private readonly logger = new Logger(ReviewController.name);

  constructor(
    @Inject('DATABASE_POOL') private readonly db: Pool,
    @Inject('TEMPORAL_CLIENT') private readonly temporalClient: Client
  ) {}

  /** submit-editorial-review skill's review queue: rows currently awaiting a human vote. */
  @Get('pending')
  async getPending() {
    const result = await this.db.query(`SELECT * FROM content_assets WHERE status = 'UNDER_REVIEW' ORDER BY created_at ASC`);
    return result.rows;
  }

  /** Signals the row's editorialReviewWorkflow instance with the human's PASS/REJECT decision. */
  @Post(':id/vote')
  async vote(@Param('id') id: string, @Body() body: EditorialVote) {
    if (body.decision !== 'PASS' && body.decision !== 'REJECT') {
      throw new BadRequestException('decision must be "PASS" or "REJECT"');
    }

    const assetResult = await this.db.query(`SELECT temporal_workflow_id FROM content_assets WHERE id = $1`, [id]);
    const asset = assetResult.rows[0];
    if (!asset?.temporal_workflow_id) {
      throw new BadRequestException(`content_assets row ${id} has no temporal_workflow_id to signal`);
    }

    const handle = this.temporalClient.workflow.getHandle(asset.temporal_workflow_id);
    await handle.signal(editorialVoteSignal, body);

    const newStatus = body.decision === 'PASS' ? 'APPROVED' : 'REJECTED';
    await this.db.query(`UPDATE content_assets SET status = $1, review_notes = $2 WHERE id = $3`, [newStatus, body.notes ?? null, id]);

    this.logger.log(`[ReviewController] content_assets ${id} -> ${newStatus} (workflow ${asset.temporal_workflow_id})`);
    return { id, status: newStatus };
  }
}
