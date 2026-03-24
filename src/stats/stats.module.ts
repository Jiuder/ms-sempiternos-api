import { Module } from '@nestjs/common';
import { SharedModule } from '@shared/shared.module';
import { StatsController } from '@stats/controllers/stats.controller';
import { StatsRepository } from '@stats/repositories/stats.repository';
import { StatsService } from '@stats/services/stats.service';

@Module({
  imports: [SharedModule],
  controllers: [StatsController],
  providers: [StatsService, StatsRepository],
  exports: [StatsService],
})
export class StatsModule {}
