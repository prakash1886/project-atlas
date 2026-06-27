import { Module } from '@nestjs/common';
import { GraphService } from './graph.service.js';
import { GraphActivities } from './graph.activities.js';
import { LlmModule } from '../llm/llm.module.js';

@Module({
  imports: [LlmModule],
  providers: [GraphService, GraphActivities],
  exports: [GraphService, GraphActivities],
})
export class GraphModule {}
