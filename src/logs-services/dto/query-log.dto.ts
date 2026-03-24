import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { LogLevel } from '@shared/entities/log-entry.entity';

export class QueryLogDto {
  @ApiPropertyOptional({ enum: LogLevel })
  @IsOptional()
  @IsEnum(LogLevel)
  level?: LogLevel;

  @ApiPropertyOptional({ example: 'auth-service' })
  @IsOptional()
  @IsString()
  service?: string;

  @ApiPropertyOptional({ example: '2026-03-13T00:00:00Z' })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({ example: '2026-03-13T23:59:59Z' })
  @IsOptional()
  @IsISO8601()
  to?: string;
}
