import { ApiProperty } from '@nestjs/swagger';
import { LogLevel } from '@shared/entities/log-entry.entity';

export class LogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty({ enum: LogLevel })
  level: LogLevel;

  @ApiProperty()
  service: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: 'object', additionalProperties: true, nullable: true })
  metadata?: Record<string, unknown>;

  @ApiProperty()
  isDuplicate: boolean;

  @ApiProperty()
  ingestedAt: string;
}
