import { Module } from '@nestjs/common';
import { SharedModule } from '@shared/shared.module';
import { StatsModule } from '@stats/stats.module';
import { LogsController } from '@logs/controllers/logs.controller';
import { LogsRepository } from '@logs/repositories/logs.repository';
import { LogsService } from '@logs/services/logs.service';

@Module({
  imports: [SharedModule, StatsModule],
  controllers: [LogsController],
  providers: [LogsService, LogsRepository],
})
export class LogsModule {}
