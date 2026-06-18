import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module.js';
import { RedisModule } from './modules/redis/redis.module.js';
import { TemporalModule } from './modules/temporal/temporal.module.js';
import { LlmModule } from './modules/llm/llm.module.js';
import { EnvatoModule } from './modules/envato/envato.module.js';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    TemporalModule,
    LlmModule,
    EnvatoModule,
  ],
})
export class AppModule {}
