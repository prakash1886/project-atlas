import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller.js';
import { ReviewAuthGuard } from './review-auth.guard.js';

@Module({
  controllers: [ReviewController],
  providers: [ReviewAuthGuard],
})
export class ReviewModule {}
