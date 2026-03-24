import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StatsService } from '@stats/services/stats.service';
import { StatsRepository } from '@stats/repositories/stats.repository';
import { SlidingWindowSet } from '@shared/data-structures/sliding-window-set';

const mockStatsRepository = {
  getTopErrors: jest.fn(),
  getLevelCounts: jest.fn(),
  incrementLevel: jest.fn(),
  incrementError: jest.fn(),
  incrementBatch: jest.fn(),
};

const mockSlidingWindowSet = {
  size: 50,
};

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue(10),
};

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: StatsRepository, useValue: mockStatsRepository },
        { provide: SlidingWindowSet, useValue: mockSlidingWindowSet },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    jest.clearAllMocks();
  });

  describe('getTopErrors', () => {
    it('should return errors sorted by count descending using MinHeap', async () => {
      const rawErrors = [
        { errorMessage: 'DB timeout', count: 5 },
        { errorMessage: 'Auth failure', count: 20 },
        { errorMessage: 'Not found', count: 10 },
      ];
      mockStatsRepository.getTopErrors.mockResolvedValueOnce(rawErrors);

      const result = await service.getTopErrors();

      expect(result[0].count).toBeGreaterThanOrEqual(result[1]?.count ?? 0);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should return at most k=10 errors', async () => {
      const rawErrors = Array.from({ length: 20 }, (_, i) => ({
        errorMessage: `Error ${i}`,
        count: i + 1,
      }));
      mockStatsRepository.getTopErrors.mockResolvedValueOnce(rawErrors);

      const result = await service.getTopErrors();

      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should return empty array when no errors', async () => {
      mockStatsRepository.getTopErrors.mockResolvedValueOnce([]);
      const result = await service.getTopErrors();
      expect(result).toEqual([]);
    });
  });

  describe('getSummary', () => {
    it('should return level counts and unique IDs from sliding window', async () => {
      mockStatsRepository.getLevelCounts.mockResolvedValueOnce({
        totalLogs: 100,
        infoCount: 60,
        warnCount: 20,
        errorCount: 15,
        debugCount: 5,
        duplicateCount: 3,
      });

      const result = await service.getSummary();

      expect(result.totalLogs).toBe(100);
      expect(result.uniqueIds).toBe(50);
      expect(result.duplicateCount).toBe(3);
    });
  });

  describe('recordLog', () => {
    it('should increment level and NOT increment error when level is not ERROR', async () => {
      mockStatsRepository.incrementBatch.mockResolvedValueOnce(undefined);

      await service.recordLog('Some info', 'INFO', false);

      expect(mockStatsRepository.incrementBatch).toHaveBeenCalledWith([
        { message: 'Some info', level: 'INFO', isDuplicate: false, isError: false },
      ]);
    });

    it('should increment level AND increment error when level is ERROR', async () => {
      mockStatsRepository.incrementBatch.mockResolvedValueOnce(undefined);

      await service.recordLog('Some error', 'ERROR', true);

      expect(mockStatsRepository.incrementBatch).toHaveBeenCalledWith([
        { message: 'Some error', level: 'ERROR', isDuplicate: true, isError: true },
      ]);
    });
  });
});
