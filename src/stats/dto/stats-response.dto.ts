import { ApiProperty } from '@nestjs/swagger';

export class ErrorRankDto {
  @ApiProperty({ example: 'Connection timeout' })
  errorMessage: string;

  @ApiProperty({ example: 42 })
  count: number;
}

export class SummaryDto {
  @ApiProperty()
  totalLogs: number;

  @ApiProperty()
  infoCount: number;

  @ApiProperty()
  warnCount: number;

  @ApiProperty()
  errorCount: number;

  @ApiProperty()
  debugCount: number;

  @ApiProperty()
  duplicateCount: number;

  @ApiProperty()
  uniqueIds: number;
}
