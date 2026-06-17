import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module.js';
import { RedisModule } from './modules/redis/redis.module.js';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
  ],
})
export class AppModule {}
