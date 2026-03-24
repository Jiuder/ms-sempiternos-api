import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { Readable } from 'stream';
import { LogsService } from '@logs/services/logs.service';
import { IngestLogDto } from '@logs/dto/ingest-log.dto';
import { QueryLogDto } from '@logs/dto/query-log.dto';
import { LogResponseDto } from '@logs/dto/log-response.dto';

@ApiTags('📜 Logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post('ingest')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ingest a single log entry' })
  @ApiCreatedResponse({ description: 'Log entry successfully ingested', type: LogResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid log payload' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error while ingesting log' })
  public ingestOne(@Body() dto: IngestLogDto): Promise<LogResponseDto> {
    return this.logsService.ingestOne(dto);
  }

  @Post('ingest/stream')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/octet-stream', 'text/plain')
  @ApiOperation({ summary: 'Ingest a NDJSON log file via stream (no memory buffering)' })
  @ApiBody({
    description: 'Raw NDJSON/TXT file body',
    required: true,
    schema: { type: 'string', format: 'binary' },
  })
  @ApiOkResponse({
    description: 'Stream fully parsed and processed',
    schema: { example: { processed: 1542, duplicates: 34, errors: 2 } },
  })
  @ApiBadRequestResponse({ description: 'Invalid stream format' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error while processing stream' })
  public ingestStream(
    @Req() req: Request,
  ): Promise<{ processed: number; duplicates: number; errors: number }> {
    if (!req.readable) {
      throw new BadRequestException('Request body is not a readable stream');
    }
    return this.logsService.ingestStream(req as unknown as Readable);
  }

  @Get()
  @ApiOperation({ summary: 'Query logs with optional filters' })
  @ApiOkResponse({ description: 'Returns an array of matched log entries', type: [LogResponseDto] })
  @ApiBadRequestResponse({ description: 'Invalid query parameters provided' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error during search' })
  public findMany(@Query() query: QueryLogDto): Promise<LogResponseDto[]> {
    return this.logsService.queryLogs(query);
  }
}
