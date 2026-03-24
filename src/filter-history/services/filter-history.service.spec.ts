import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FilterHistoryService } from '@filter-history/services/filter-history.service';
import { FilterHistoryRepository } from '@filter-history/repositories/filter-history.repository';
import { UndoStack } from '@shared/data-structures/undo-stack';
import { PushFilterDto } from '@filter-history/dto/filter-history.dto';

const mockFilterHistoryRepository = {
  saveSnapshot: jest.fn(),
  loadSnapshot: jest.fn(),
};

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue(50),
};

describe('FilterHistoryService', () => {
  let service: FilterHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilterHistoryService,
        UndoStack,
        { provide: FilterHistoryRepository, useValue: mockFilterHistoryRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<FilterHistoryService>(FilterHistoryService);
    mockFilterHistoryRepository.loadSnapshot.mockResolvedValue([]);
    await service.onModuleInit();
    jest.clearAllMocks();
  });

  describe('push', () => {
    it('should push a filter state and persist snapshot', async () => {
      mockFilterHistoryRepository.saveSnapshot.mockResolvedValueOnce(undefined);
      const dto: PushFilterDto = { level: 'ERROR' };

      const result = await service.push(dto);

      expect(result.size).toBe(1);
      expect(result.current).toMatchObject({ level: 'ERROR' });
      expect(mockFilterHistoryRepository.saveSnapshot).toHaveBeenCalled();
    });

    it('should stack multiple filters', async () => {
      mockFilterHistoryRepository.saveSnapshot.mockResolvedValue(undefined);

      await service.push({ level: 'INFO' });
      const result = await service.push({ service: 'auth-service' });

      expect(result.size).toBe(2);
    });
  });

  describe('undo', () => {
    it('should pop the last filter and return previous state', async () => {
      mockFilterHistoryRepository.saveSnapshot.mockResolvedValue(undefined);
      await service.push({ level: 'ERROR' });

      const result = await service.undo();

      expect(result.size).toBe(0);
      expect(result.current).toBeNull();
    });

    it('should handle undo on empty stack gracefully', async () => {
      mockFilterHistoryRepository.saveSnapshot.mockResolvedValueOnce(undefined);

      const result = await service.undo();

      expect(result.size).toBe(0);
    });
  });

  describe('getCurrent', () => {
    it('should peek current filter without modifying stack', async () => {
      mockFilterHistoryRepository.saveSnapshot.mockResolvedValue(undefined);
      await service.push({ level: 'WARN' });

      const result = service.getCurrent();

      expect(result.current).toMatchObject({ level: 'WARN' });
      expect(result.size).toBe(1);
    });
  });

  describe('onModuleInit', () => {
    it('should hydrate the stack from Redis snapshot', async () => {
      const snapshot = [
        { level: 'ERROR', appliedAt: Date.now() },
        { service: 'payment', appliedAt: Date.now() },
      ];
      mockFilterHistoryRepository.loadSnapshot.mockResolvedValueOnce(snapshot);

      await service.onModuleInit();

      const result = service.getCurrent();
      expect(result.size).toBe(2);
    });
  });
});
