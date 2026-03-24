import { Global, Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService): Redis => {
        const url = configService.get<string>('config.redis.url');
        const client = new Redis(url as string);
        client.on('error', (err: Error) => {
          Logger.error(`[Redis] Connection failed to ${url}: ${err.message}`, 'RedisModule');
        });
        return client;
      },
      inject: [ConfigService], // Added inject for ConfigService
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
