import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { LogLevel } from '@shared/entities/log-entry.entity';

export class IngestLogDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: '2026-03-13T14:20:01Z' })
  @IsISO8601()
  timestamp: string;

  @ApiProperty({ enum: LogLevel, example: LogLevel.INFO })
  @IsEnum(LogLevel)
  level: LogLevel;

  @ApiProperty({ example: 'auth-service' })
  @IsString()
  service: string;

  @ApiProperty({ example: 'User login successful' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
