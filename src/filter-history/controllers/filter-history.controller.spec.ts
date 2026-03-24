import { Test, TestingModule } from '@nestjs/testing';
import { FilterHistoryController } from '@filter-history/controllers/filter-history.controller';
import { FilterHistoryService } from '@filter-history/services/filter-history.service';
import { PushFilterDto } from '@filter-history/dto/filter-history.dto';

const mockFilterHistoryService = {
  push: jest.fn(),
  undo: jest.fn(),
  getCurrent: jest.fn(),
};

describe('FilterHistoryController', () => {
  let controller: FilterHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilterHistoryController],
      providers: [{ provide: FilterHistoryService, useValue: mockFilterHistoryService }],
    }).compile();

    controller = module.get<FilterHistoryController>(FilterHistoryController);
    jest.clearAllMocks();
  });

  describe('push', () => {
    it('should call service push and return updated history', async () => {
      const dto: PushFilterDto = { level: 'ERROR', service: 'auth-service' };
      const mockResponse = { current: dto, size: 1, history: [dto] };
      mockFilterHistoryService.push.mockResolvedValueOnce(mockResponse);

      const result = await controller.push(dto);

      expect(mockFilterHistoryService.push).toHaveBeenCalledWith(dto);
      expect(result.size).toBe(1);
    });
  });

  describe('undo', () => {
    it('should pop the last filter and return updated state', async () => {
      const mockResponse = { current: null, size: 0, history: [] };
      mockFilterHistoryService.undo.mockResolvedValueOnce(mockResponse);

      const result = await controller.undo();

      expect(mockFilterHistoryService.undo).toHaveBeenCalled();
      expect(result.size).toBe(0);
    });
  });

  describe('getCurrent', () => {
    it('should return current filter without modifying the stack', () => {
      const mockResponse = { current: { level: 'WARN' }, size: 2, history: [] };
      mockFilterHistoryService.getCurrent.mockReturnValueOnce(mockResponse);

      const result = controller.getCurrent();

      expect(result.current).toEqual({ level: 'WARN' });
    });
  });
});
