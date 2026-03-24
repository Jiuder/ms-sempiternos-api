import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from '@stats/controllers/stats.controller';
import { StatsService } from '@stats/services/stats.service';
import { ErrorRankDto, SummaryDto } from '@stats/dto/stats-response.dto';

const mockStatsService = {
  getTopErrors: jest.fn(),
  getSummary: jest.fn(),
};

describe('StatsController', () => {
  let controller: StatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [{ provide: StatsService, useValue: mockStatsService }],
    }).compile();

    controller = module.get<StatsController>(StatsController);
    jest.clearAllMocks();
  });

  describe('getTopErrors', () => {
    it('should return top errors from the service', async () => {
      const mockErrors: ErrorRankDto[] = [
        { errorMessage: 'Connection timeout', count: 42 },
        { errorMessage: 'Not found', count: 15 },
      ];
      mockStatsService.getTopErrors.mockResolvedValueOnce(mockErrors);

      const result = await controller.getTopErrors();

      expect(mockStatsService.getTopErrors).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].count).toBe(42);
    });

    it('should return empty array when no errors', async () => {
      mockStatsService.getTopErrors.mockResolvedValueOnce([]);
      const result = await controller.getTopErrors();
      expect(result).toEqual([]);
    });
  });

  describe('getSummary', () => {
    it('should return summary stats', async () => {
      const mockSummary: SummaryDto = {
        totalLogs: 100,
        infoCount: 60,
        warnCount: 20,
        errorCount: 15,
        debugCount: 5,
        duplicateCount: 3,
        uniqueIds: 97,
      };
      mockStatsService.getSummary.mockResolvedValueOnce(mockSummary);

      const result = await controller.getSummary();

      expect(result.totalLogs).toBe(100);
      expect(result.errorCount).toBe(15);
    });
  });
});
