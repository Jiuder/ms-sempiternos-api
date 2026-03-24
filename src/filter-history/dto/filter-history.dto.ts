import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { LogLevel } from '@shared/entities/log-entry.entity';

export class PushFilterDto {
  @ApiPropertyOptional({ enum: LogLevel })
  @IsOptional()
  @IsEnum(LogLevel)
  level?: string;

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

export class FilterStateDto {
  @ApiPropertyOptional({ enum: LogLevel })
  level?: string;

  @ApiPropertyOptional({ example: 'auth-service' })
  service?: string;

  @ApiPropertyOptional({ example: '2026-03-13T00:00:00Z' })
  from?: string;

  @ApiPropertyOptional({ example: '2026-03-13T23:59:59Z' })
  to?: string;

  @ApiProperty({ example: 1710373652876 })
  appliedAt: number;
}

export class FilterHistoryResponseDto {
  @ApiProperty({ type: FilterStateDto, required: false, nullable: true })
  current: FilterStateDto | null;

  @ApiProperty()
  size: number;

  @ApiProperty({ type: [FilterStateDto] })
  history: FilterStateDto[];
}
