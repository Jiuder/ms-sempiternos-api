import { Injectable } from '@nestjs/common';
import { MinHeap } from '@shared/data-structures/min-heap';
import { SlidingWindowSet } from '@shared/data-structures/sliding-window-set';
import { ConfigService } from '@nestjs/config';
import { ErrorRankDto, SummaryDto } from '@stats/dto/stats-response.dto';
import { ErrorCount } from '@stats/interfaces/error-count.interface';
import { StatsRepository } from '@stats/repositories/stats.repository';

@Injectable()
export class StatsService {
  private readonly topK: number;

  constructor(
    private readonly statsRepository: StatsRepository,
    private readonly slidingWindowSet: SlidingWindowSet,
    private readonly configService: ConfigService,
  ) {
    this.topK = this.configService.getOrThrow<number>('config.logStream.topErrorsK');
  }

  public async getTopErrors(): Promise<ErrorRankDto[]> {
    const allErrors = await this.statsRepository.getTopErrors(this.topK * 10);
    const heap = new MinHeap<ErrorCount>((a, b) => a.count - b.count);

    for (const error of allErrors) {
      heap.push(error);
      if (heap.size > this.topK) {
        heap.pop();
      }
    }

    return heap
      .toSortedArray()
      .reverse()
      .map((e) => ({ errorMessage: e.errorMessage, count: e.count }));
  }

  public async getSummary(): Promise<SummaryDto> {
    const counts = await this.statsRepository.getLevelCounts();
    return {
      totalLogs: counts.totalLogs,
      infoCount: counts.infoCount,
      warnCount: counts.warnCount,
      errorCount: counts.errorCount,
      debugCount: counts.debugCount,
      duplicateCount: counts.duplicateCount,
      uniqueIds: this.slidingWindowSet.size,
    };
  }

  public async recordLog(message: string, level: string, isDuplicate: boolean): Promise<void> {
    await this.recordBatch([{ message, level, isDuplicate }]);
  }

  public async recordBatch(
    updates: { message: string; level: string; isDuplicate: boolean }[],
  ): Promise<void> {
    const formattedUpdates = updates.map((u) => ({
      ...u,
      isError: u.level === 'ERROR',
    }));
    await this.statsRepository.incrementBatch(formattedUpdates);
  }
}
