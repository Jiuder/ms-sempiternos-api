import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '@redis/redis.module';
import { LogEntry, LogLevel } from '@shared/entities/log-entry.entity';
import { QueryLogDto } from '@logs/dto/query-log.dto';
import { StoredLog } from '@logs/interfaces/stored-log.interface';

@Injectable()
export class LogsRepository {
  private static readonly KEY_PREFIX = 'log:';
  private static readonly INDEX_KEY = 'logs:index';

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  public async save(log: LogEntry): Promise<void> {
    await this.saveBatch([log]);
  }

  public async saveBatch(entries: LogEntry[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    for (const log of entries) {
      const key = `${LogsRepository.KEY_PREFIX}${log.id}`;
      pipeline.hset(key, {
        id: log.id,
        timestamp: log.timestamp,
        level: log.level,
        service: log.service,
        message: log.message,
        metadata: JSON.stringify(log.metadata ?? {}),
        isDuplicate: log.isDuplicate ? '1' : '0',
        ingestedAt: new Date().toISOString(),
      });
      pipeline.zadd(LogsRepository.INDEX_KEY, new Date(log.timestamp).getTime(), log.id);
    }
    await pipeline.exec();
  }

  public async findMany(filter: QueryLogDto): Promise<LogEntry[]> {
    const fromScore = filter.from ? new Date(filter.from).getTime() : '-inf';
    const toScore = filter.to ? new Date(filter.to).getTime() : '+inf';

    const ids = await this.redis.zrangebyscore(LogsRepository.INDEX_KEY, fromScore, toScore);
    if (ids.length === 0) return [];

    const pipeline = this.redis.pipeline();
    ids.forEach((id) => pipeline.hgetall(`${LogsRepository.KEY_PREFIX}${id}`));
    const results = await pipeline.exec();

    return (results ?? [])
      .map(([, data]) => {
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) return null;
        return this.mapToLogEntry(data as StoredLog);
      })
      .filter((log): log is LogEntry => {
        if (!log) return false;
        if (filter.level && log.level !== filter.level) return false;
        return !(filter.service && log.service !== filter.service);
      });
  }

  public async findById(id: string): Promise<LogEntry | null> {
    const raw = await this.redis.hgetall(`${LogsRepository.KEY_PREFIX}${id}`);
    if (!raw || Object.keys(raw).length === 0) return null;
    return this.mapToLogEntry(raw as unknown as StoredLog);
  }

  private mapToLogEntry(data: StoredLog): LogEntry {
    const entry = new LogEntry();
    entry.id = data.id;
    entry.timestamp = data.timestamp;
    entry.level = data.level as LogLevel;
    entry.service = data.service;
    entry.message = data.message;
    entry.metadata = JSON.parse(data.metadata || '{}') as Record<string, unknown>;
    entry.isDuplicate = String(data.isDuplicate) === '1' || data.isDuplicate;
    return entry;
  }
}
