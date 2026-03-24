import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '@redis/redis.module';
import { FilterStateDto } from '@filter-history/dto/filter-history.dto';

@Injectable()
export class FilterHistoryRepository {
  private static readonly SNAPSHOT_KEY = 'filter_history:snapshot';

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  public async saveSnapshot(states: FilterStateDto[]): Promise<void> {
    await this.redis.set(FilterHistoryRepository.SNAPSHOT_KEY, JSON.stringify(states));
  }

  public async loadSnapshot(): Promise<FilterStateDto[]> {
    const raw = await this.redis.get(FilterHistoryRepository.SNAPSHOT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FilterStateDto[];
  }
}
