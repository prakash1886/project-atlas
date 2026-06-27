import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module.js';
import { RedisModule } from './modules/redis/redis.module.js';
import { TemporalModule } from './modules/temporal/temporal.module.js';
import { LlmModule } from './modules/llm/llm.module.js';
import { EnvatoModule } from './modules/envato/envato.module.js';
import { SearchModule } from './modules/search/search.module.js';
import { VideoModule } from './modules/video/video.module.js';
import { GraphModule } from './modules/graph/graph.module.js';
import { ReviewModule } from './modules/review/review.module.js';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    TemporalModule,
    LlmModule,
    EnvatoModule,
    SearchModule,
    VideoModule,
    GraphModule,
    ReviewModule,
  ],
})
export class AppModule {}
