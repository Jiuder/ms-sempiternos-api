import { Test, TestingModule } from '@nestjs/testing';
import { LogsService } from '@logs/services/logs.service';
import { LogsRepository } from '@logs/repositories/logs.repository';
import { SlidingWindowSet } from '@shared/data-structures/sliding-window-set';
import { StatsService } from '@stats/services/stats.service';
import { IngestLogDto } from '@logs/dto/ingest-log.dto';
import { LogLevel } from '@shared/entities/log-entry.entity';
import { Readable } from 'stream';

const mockLogsRepository = {
  save: jest.fn(),
  saveBatch: jest.fn(),
  findMany: jest.fn(),
};

const mockSlidingWindowSet = {
  add: jest.fn(),
};

const mockStatsService = {
  recordLog: jest.fn(),
  recordBatch: jest.fn(),
};

describe('LogsService', () => {
  let service: LogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogsService,
        { provide: LogsRepository, useValue: mockLogsRepository },
        { provide: SlidingWindowSet, useValue: mockSlidingWindowSet },
        { provide: StatsService, useValue: mockStatsService },
      ],
    }).compile();

    service = module.get<LogsService>(LogsService);
    jest.clearAllMocks();
  });

  describe('ingestOne', () => {
    const dto: IngestLogDto = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      timestamp: '2026-03-13T14:20:01Z',
      level: LogLevel.INFO,
      service: 'auth-service',
      message: 'User login successful',
    };

    it('should detect a new log as non-duplicate', async () => {
      mockSlidingWindowSet.add.mockReturnValueOnce(false);
      mockLogsRepository.saveBatch.mockResolvedValueOnce(undefined);
      mockStatsService.recordBatch.mockResolvedValueOnce(undefined);

      const result = await service.ingestOne(dto);

      expect(mockSlidingWindowSet.add).toHaveBeenCalledWith(dto.id);
      expect(mockLogsRepository.saveBatch).toHaveBeenCalled();
      expect(mockStatsService.recordBatch).toHaveBeenCalledWith([
        { message: dto.message, level: LogLevel.INFO, isDuplicate: false },
      ]);
      expect(result.isDuplicate).toBe(false);
      expect(result.id).toBe(dto.id);
    });

    it('should detect a duplicate log', async () => {
      mockSlidingWindowSet.add.mockReturnValueOnce(true);
      mockLogsRepository.saveBatch.mockResolvedValueOnce(undefined);
      mockStatsService.recordBatch.mockResolvedValueOnce(undefined);

      const result = await service.ingestOne(dto);

      expect(result.isDuplicate).toBe(true);
    });

    it('should generate a UUID if no id is provided', async () => {
      mockSlidingWindowSet.add.mockReturnValueOnce(false);
      mockLogsRepository.saveBatch.mockResolvedValueOnce(undefined);
      mockStatsService.recordBatch.mockResolvedValueOnce(undefined);
      const dtoNoId: IngestLogDto = { ...dto, id: undefined };

      const result = await service.ingestOne(dtoNoId);

      expect(result.id).toBeTruthy();
      expect(typeof result.id).toBe('string');
    });

    it('should call statsService.recordBatch with correct level', async () => {
      mockSlidingWindowSet.add.mockReturnValueOnce(false);
      mockLogsRepository.saveBatch.mockResolvedValueOnce(undefined);
      mockStatsService.recordBatch.mockResolvedValueOnce(undefined);

      await service.ingestOne(dto);

      expect(mockStatsService.recordBatch).toHaveBeenCalledWith([
        { message: dto.message, level: LogLevel.INFO, isDuplicate: false },
      ]);
    });
  });

  describe('queryLogs', () => {
    it('should return mapped response DTOs from repository', async () => {
      const entries = [
        {
          id: 'id-1',
          timestamp: '2026-03-13T14:20:01Z',
          level: LogLevel.ERROR,
          service: 'payment-gateway',
          message: 'Connection timeout',
          metadata: {},
          isDuplicate: false,
        },
      ];
      mockLogsRepository.findMany.mockResolvedValueOnce(entries);

      const result = await service.queryLogs({ level: LogLevel.ERROR });

      expect(result).toHaveLength(1);
      expect(result[0].level).toBe(LogLevel.ERROR);
    });

    it('should return empty array when no logs found', async () => {
      mockLogsRepository.findMany.mockResolvedValueOnce([]);
      const result = await service.queryLogs({});
      expect(result).toEqual([]);
    });
  });

  describe('ingestStream', () => {
    it('should process a stream of logs line by line, handle empty lines, bad json, and duplicates', async () => {
      const logs = [
        `{"level": "INFO", "service": "api", "message": "Log 1", "timestamp": "2026-03-24T00:00:00Z"}`,
        ` `,
        `invalid json`,
        `{"id": "duplicate-id", "level": "ERROR", "service": "db", "message": "Log 3", "timestamp": "2026-03-24T00:00:01Z"}`,
      ].join('\n');

      const stream = Readable.from([logs]);

      mockSlidingWindowSet.add.mockReturnValueOnce(false);
      mockSlidingWindowSet.add.mockReturnValueOnce(true);

      mockSlidingWindowSet.add.mockReturnValueOnce(false);
      mockSlidingWindowSet.add.mockReturnValueOnce(true);

      mockLogsRepository.saveBatch.mockResolvedValue(undefined);
      mockStatsService.recordBatch.mockResolvedValue(undefined);

      const result = await service.ingestStream(stream);

      expect(result.processed).toBe(2);
      expect(result.duplicates).toBe(1);
      expect(result.errors).toBe(1);
      expect(mockLogsRepository.saveBatch).toHaveBeenCalledTimes(1);
      expect(mockStatsService.recordBatch).toHaveBeenCalledTimes(1);
    });

    it('should process a formatted JSON array stream (ignoring brackets and trailing commas)', async () => {
      const logs = [
        `[`,
        `  {"level": "INFO", "service": "api", "message": "Log 1", "timestamp": "2026-03-24T00:00:00Z"},`,
        `  {"level": "ERROR", "service": "db", "message": "Log 2", "timestamp": "2026-03-24T00:00:01Z"}`,
        `]`,
      ].join('\n');

      const stream = Readable.from([logs]);
      mockSlidingWindowSet.add.mockReturnValue(false);
      mockLogsRepository.saveBatch.mockResolvedValue(undefined);
      mockStatsService.recordBatch.mockResolvedValue(undefined);

      const result = await service.ingestStream(stream);

      expect(result.processed).toBe(2);
      expect(result.errors).toBe(0);
      expect(mockLogsRepository.saveBatch).toHaveBeenCalledTimes(1);
    });

    it('should process a single-line JSON array', async () => {
      const logs = `[{"level": "INFO", "service": "api", "message": "Log 1"}, {"level": "WARN", "service": "api", "message": "Log 2"}]`;
      const stream = Readable.from([logs]);
      mockSlidingWindowSet.add.mockReturnValue(false);
      mockLogsRepository.saveBatch.mockResolvedValue(undefined);
      mockStatsService.recordBatch.mockResolvedValue(undefined);

      const result = await service.ingestStream(stream);

      expect(result.processed).toBe(2);
      expect(result.errors).toBe(0);
      expect(mockLogsRepository.saveBatch).toHaveBeenCalledTimes(1);
    });

    it('should trigger flushBatch when BATCH_SIZE is reached', async () => {
      const manyLogs = Array.from(
        { length: 1001 },
        (_, i) => `{"level": "INFO", "message": "Log ${i}"}`,
      ).join('\n');

      const stream = Readable.from([manyLogs]);
      mockSlidingWindowSet.add.mockReturnValue(false);
      mockLogsRepository.saveBatch.mockResolvedValue(undefined);
      mockStatsService.recordBatch.mockResolvedValue(undefined);

      const result = await service.ingestStream(stream);

      expect(result.processed).toBe(1001);
      expect(mockLogsRepository.saveBatch).toHaveBeenCalledTimes(2);
      expect(mockStatsService.recordBatch).toHaveBeenCalledTimes(2);
    });

    it('should handle an empty stream without calling flushBatch', async () => {
      const stream = Readable.from(['']);
      const result = await service.ingestStream(stream);

      expect(result.processed).toBe(0);
      expect(mockLogsRepository.saveBatch).not.toHaveBeenCalled();
    });
  });
});
