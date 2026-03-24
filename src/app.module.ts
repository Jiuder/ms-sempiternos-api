import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggingMiddleware } from '@shared/middlewares/logging.middleware';
import { ConfigModule } from '@nestjs/config';
import appConfig from '@config/app.config';
import { validate } from '@config/env.validation';
import { RedisModule } from '@redis/redis.module';
import { LogsModule } from '@logs/logs.module';
import { StatsModule } from '@stats/stats.module';
import { FilterHistoryModule } from '@filter-history/filter-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate,
    }),
    RedisModule,
    LogsModule,
    StatsModule,
    FilterHistoryModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
