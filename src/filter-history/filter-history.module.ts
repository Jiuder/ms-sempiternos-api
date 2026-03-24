import { Module } from '@nestjs/common';
import { UndoStack } from '@shared/data-structures/undo-stack';
import { FilterHistoryController } from '@filter-history/controllers/filter-history.controller';
import { FilterHistoryRepository } from '@filter-history/repositories/filter-history.repository';
import { FilterHistoryService } from '@filter-history/services/filter-history.service';

@Module({
  controllers: [FilterHistoryController],
  providers: [FilterHistoryService, FilterHistoryRepository, UndoStack],
})
export class FilterHistoryModule {}
