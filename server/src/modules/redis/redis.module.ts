import { Module, Global } from '@nestjs/common';
import IORedis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        console.log('[RedisModule] Connecting to Redis...');
        // We create a mock/fallback client if Redis is unavailable to prevent app crash
        try {
          return new IORedis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
        } catch (e) {
          console.warn('[RedisModule] Redis connection failed, using stub');
          return {};
        }
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
