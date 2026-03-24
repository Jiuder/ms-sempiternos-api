import { ApiProperty } from '@nestjs/swagger';

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

export class LogEntry {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '2026-03-13T14:20:01Z' })
  timestamp: string;

  @ApiProperty({ enum: LogLevel, example: LogLevel.INFO })
  level: LogLevel;

  @ApiProperty({ example: 'auth-service' })
  service: string;

  @ApiProperty({ example: 'User login successful' })
  message: string;

  @ApiProperty({ type: 'object', additionalProperties: true, nullable: true })
  metadata?: Record<string, unknown>;

  @ApiProperty({ example: false })
  isDuplicate: boolean;
}
