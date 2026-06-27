import { Module } from '@nestjs/common';
import { QualityLoopService } from './quality-loop.service.js';
import { QualityLoopActivities } from './quality-loop.activities.js';
import { LlmModule } from '../llm/llm.module.js';

@Module({
  imports: [LlmModule],
  providers: [QualityLoopService, QualityLoopActivities],
  exports: [QualityLoopService, QualityLoopActivities],
})
export class QualityLoopModule {}
