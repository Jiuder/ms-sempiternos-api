import { Injectable, OnModuleInit } from '@nestjs/common';
import { UndoStack } from '@shared/data-structures/undo-stack';
import {
  FilterStateDto,
  FilterHistoryResponseDto,
  PushFilterDto,
} from '@filter-history/dto/filter-history.dto';
import { FilterHistoryRepository } from '@filter-history/repositories/filter-history.repository';

@Injectable()
export class FilterHistoryService implements OnModuleInit {
  constructor(
    private readonly undoStack: UndoStack,
    private readonly filterHistoryRepository: FilterHistoryRepository,
  ) {}

  public async onModuleInit(): Promise<void> {
    const snapshot = await this.filterHistoryRepository.loadSnapshot();
    this.undoStack.hydrate(snapshot);
  }

  public async push(dto: PushFilterDto): Promise<FilterHistoryResponseDto> {
    const state: FilterStateDto = { ...dto, appliedAt: Date.now() };
    this.undoStack.push(state);
    await this.filterHistoryRepository.saveSnapshot(this.undoStack.snapshot());
    return this.buildResponse();
  }

  public async undo(): Promise<FilterHistoryResponseDto> {
    this.undoStack.pop();
    await this.filterHistoryRepository.saveSnapshot(this.undoStack.snapshot());
    return this.buildResponse();
  }

  public getCurrent(): FilterHistoryResponseDto {
    return this.buildResponse();
  }

  private buildResponse(): FilterHistoryResponseDto {
    return {
      current: this.undoStack.peek() ?? null,
      size: this.undoStack.size,
      history: this.undoStack.getAll(),
    };
  }
}
