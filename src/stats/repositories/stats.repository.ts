import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '@redis/redis.module';
import { LevelCounts } from '@stats/interfaces/level-counts.interface';
import { ErrorCount } from '@stats/interfaces/error-count.interface';

@Injectable()
export class StatsRepository {
  private static readonly ERROR_ZSET = 'stats:errors';
  private static readonly LEVEL_HASH = 'stats:levels';

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  public async incrementError(message: string): Promise<void> {
    await this.redis.zincrby(StatsRepository.ERROR_ZSET, 1, message);
  }

  public async incrementLevel(level: string, isDuplicate: boolean): Promise<void> {
    await this.incrementBatch([{ message: '', level, isDuplicate, isError: false }]);
  }

  public async incrementBatch(
    updates: { message: string; level: string; isDuplicate: boolean; isError: boolean }[],
  ): Promise<void> {
    const pipeline = this.redis.pipeline();
    for (const update of updates) {
      if (update.isError && update.message) {
        pipeline.zincrby(StatsRepository.ERROR_ZSET, 1, update.message);
      }
      const field = `${update.level.toLowerCase()}Count`;
      pipeline.hincrby(StatsRepository.LEVEL_HASH, field, 1);
      pipeline.hincrby(StatsRepository.LEVEL_HASH, 'totalLogs', 1);
      if (update.isDuplicate) {
        pipeline.hincrby(StatsRepository.LEVEL_HASH, 'duplicateCount', 1);
      }
    }
    await pipeline.exec();
  }

  public async getTopErrors(limit: number): Promise<ErrorCount[]> {
    const raw = await this.redis.zrevrange(StatsRepository.ERROR_ZSET, 0, limit - 1, 'WITHSCORES');
    const result: ErrorCount[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      result.push({ errorMessage: raw[i], count: parseInt(raw[i + 1], 10) });
    }
    return result;
  }

  private parseCount(value: string | undefined): number {
    return parseInt(value ?? '0', 10);
  }

  public async getLevelCounts(): Promise<LevelCounts> {
    const raw = await this.redis.hgetall(StatsRepository.LEVEL_HASH);
    return {
      infoCount: this.parseCount(raw.infoCount),
      warnCount: this.parseCount(raw.warnCount),
      errorCount: this.parseCount(raw.errorCount),
      debugCount: this.parseCount(raw.debugCount),
      totalLogs: this.parseCount(raw.totalLogs),
      duplicateCount: this.parseCount(raw.duplicateCount),
    };
  }
}
