import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { StatsService } from '@stats/services/stats.service';
import { ErrorRankDto, SummaryDto } from '@stats/dto/stats-response.dto';

@ApiTags('📊 Stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('top-errors')
  @ApiOperation({ summary: 'Get top-10 most frequent error messages (MinHeap O(n log k))' })
  @ApiOkResponse({
    description: 'Returns an array of the top 10 error messages globally',
    type: [ErrorRankDto],
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error while resolving stats' })
  public getTopErrors(): Promise<ErrorRankDto[]> {
    return this.statsService.getTopErrors();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get log counts by level and duplicate summary' })
  @ApiOkResponse({
    description: 'Returns an aggregation of log counts across all levels and a duplicate count',
    type: SummaryDto,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error while resolving stats' })
  public getSummary(): Promise<SummaryDto> {
    return this.statsService.getSummary();
  }
}
