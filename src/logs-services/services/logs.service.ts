import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { createInterface } from 'readline';
import { Readable } from 'stream';
import { LogEntry } from '@shared/entities/log-entry.entity';
import { SlidingWindowSet } from '@shared/data-structures/sliding-window-set';
import { StatsService } from '@stats/services/stats.service';
import { IngestLogDto } from '@logs/dto/ingest-log.dto';
import { LogResponseDto } from '@logs/dto/log-response.dto';
import { QueryLogDto } from '@logs/dto/query-log.dto';
import { StreamResult } from '@logs/dto/stream-result.dto';
import { LogsRepository } from '@logs/repositories/logs.repository';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(
    private readonly logsRepository: LogsRepository,
    private readonly slidingWindowSet: SlidingWindowSet,
    private readonly statsService: StatsService,
  ) {}

  private static readonly BATCH_SIZE = 1000;

  public async ingestOne(dto: IngestLogDto): Promise<LogResponseDto> {
    const id = dto.id ?? crypto.randomUUID();
    const isDuplicate = this.slidingWindowSet.add(id);
    const entry = this.buildEntry({ ...dto, id }, isDuplicate);
    await Promise.all([
      this.logsRepository.saveBatch([entry]),
      this.statsService.recordBatch([{ message: entry.message, level: entry.level, isDuplicate }]),
    ]);
    return this.toResponseDto(entry);
  }

  public async ingestStream(readable: Readable): Promise<StreamResult> {
    const result: StreamResult = { processed: 0, duplicates: 0, errors: 0 };
    const rl = createInterface({ input: readable, crlfDelay: Infinity });

    const batchBuffer: LogEntry[] = [];
    for await (const line of rl) {
      await this.processStreamLine(line, result, batchBuffer);
    }

    if (batchBuffer.length > 0) {
      await this.flushBatch(batchBuffer);
    }

    return result;
  }

  private async processStreamLine(
    line: string,
    result: StreamResult,
    batchBuffer: LogEntry[],
  ): Promise<void> {
    const trimmed = this.normalizeLine(line);
    if (!trimmed) return;

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      await this.processParsedItems(parsed, result, batchBuffer);
    } catch {
      result.errors++;
      this.logger.warn(`Skipping malformed line: ${trimmed.slice(0, 80)}`);
    }
  }

  private normalizeLine(line: string): string | null {
    let trimmed = line.trim();
    if (!trimmed || trimmed === '[' || trimmed === ']') return null;
    if (trimmed.endsWith(',')) trimmed = trimmed.slice(0, -1);
    return trimmed;
  }

  private async processParsedItems(
    parsed: unknown,
    result: StreamResult,
    batchBuffer: LogEntry[],
  ): Promise<void> {
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const raw of items as IngestLogDto[]) {
      await this.ingestStreamItem(raw, result, batchBuffer);
    }
  }

  private async ingestStreamItem(
    raw: IngestLogDto,
    result: StreamResult,
    batchBuffer: LogEntry[],
  ): Promise<void> {
    const id = raw.id ?? crypto.randomUUID();
    const isDuplicate = this.slidingWindowSet.add(id);
    if (isDuplicate) result.duplicates++;

    const entry = this.buildEntry({ ...raw, id }, isDuplicate);
    batchBuffer.push(entry);

    if (batchBuffer.length >= LogsService.BATCH_SIZE) {
      await this.flushBatch(batchBuffer);
      batchBuffer.length = 0;
    }

    result.processed++;
  }

  private async flushBatch(batchBuffer: LogEntry[]): Promise<void> {
    const batch = [...batchBuffer];

    const statsUpdates = batch.map((entry) => ({
      message: entry.message,
      level: entry.level,
      isDuplicate: entry.isDuplicate,
    }));

    await Promise.all([
      this.logsRepository.saveBatch(batch),
      this.statsService.recordBatch(statsUpdates),
    ]);
  }

  public async queryLogs(filter: QueryLogDto): Promise<LogResponseDto[]> {
    const entries = await this.logsRepository.findMany(filter);
    return entries.map((e) => this.toResponseDto(e));
  }

  private buildEntry(dto: IngestLogDto & { id: string }, isDuplicate: boolean): LogEntry {
    const entry = new LogEntry();
    entry.id = dto.id;
    entry.timestamp = dto.timestamp;
    entry.level = dto.level;
    entry.service = dto.service;
    entry.message = dto.message;
    entry.metadata = dto.metadata;
    entry.isDuplicate = isDuplicate;
    return entry;
  }

  private toResponseDto(entry: LogEntry): LogResponseDto {
    const dto = new LogResponseDto();
    dto.id = entry.id;
    dto.timestamp = entry.timestamp;
    dto.level = entry.level;
    dto.service = entry.service;
    dto.message = entry.message;
    dto.metadata = entry.metadata;
    dto.isDuplicate = entry.isDuplicate;
    dto.ingestedAt = new Date().toISOString();
    return dto;
  }
}
