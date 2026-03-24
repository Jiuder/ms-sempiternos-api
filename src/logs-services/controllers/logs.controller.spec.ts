import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { LogsController } from '@logs/controllers/logs.controller';
import { LogsService } from '@logs/services/logs.service';
import { IngestLogDto } from '@logs/dto/ingest-log.dto';
import { QueryLogDto } from '@logs/dto/query-log.dto';
import { LogResponseDto } from '@logs/dto/log-response.dto';
import { LogLevel } from '@shared/entities/log-entry.entity';

const mockLogResponse: LogResponseDto = {
  id: 'test-id',
  timestamp: '2026-03-13T14:20:01Z',
  level: LogLevel.INFO,
  service: 'auth-service',
  message: 'User login successful',
  metadata: {},
  isDuplicate: false,
  ingestedAt: new Date().toISOString(),
};

const mockLogsService = {
  ingestOne: jest.fn(),
  ingestStream: jest.fn(),
  queryLogs: jest.fn(),
};

describe('LogsController', () => {
  let controller: LogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsController],
      providers: [{ provide: LogsService, useValue: mockLogsService }],
    }).compile();

    controller = module.get<LogsController>(LogsController);
    jest.clearAllMocks();
  });

  describe('ingestOne', () => {
    it('should call logsService.ingestOne and return a LogResponseDto', async () => {
      mockLogsService.ingestOne.mockResolvedValueOnce(mockLogResponse);
      const dto: IngestLogDto = {
        timestamp: '2026-03-13T14:20:01Z',
        level: LogLevel.INFO,
        service: 'auth-service',
        message: 'User login successful',
      };

      const result = await controller.ingestOne(dto);

      expect(mockLogsService.ingestOne).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockLogResponse);
    });

    it('should propagate errors from the service', async () => {
      mockLogsService.ingestOne.mockRejectedValueOnce(new Error('Redis down'));
      await expect(controller.ingestOne({} as IngestLogDto)).rejects.toThrow('Redis down');
    });
  });

  describe('ingestStream', () => {
    it('should call logsService.ingestStream with the request', async () => {
      const mockResult = { processed: 4, duplicates: 1, errors: 0 };
      mockLogsService.ingestStream.mockResolvedValueOnce(mockResult);
      const req = { readable: true } as unknown as Request;

      const result = await controller.ingestStream(req);

      expect(mockLogsService.ingestStream).toHaveBeenCalledWith(req);
      expect(result).toEqual(mockResult);
    });

    it('should throw BadRequestException if request is not readable', () => {
      const req = { readable: false } as unknown as Request;
      expect(() => controller.ingestStream(req)).toThrow(BadRequestException);
    });
  });

  describe('findMany', () => {
    it('should return an array of logs', async () => {
      mockLogsService.queryLogs.mockResolvedValueOnce([mockLogResponse]);
      const query: QueryLogDto = { level: LogLevel.INFO };

      const result = await controller.findMany(query);

      expect(mockLogsService.queryLogs).toHaveBeenCalledWith(query);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no logs match', async () => {
      mockLogsService.queryLogs.mockResolvedValueOnce([]);
      const result = await controller.findMany({});
      expect(result).toEqual([]);
    });
  });
});
