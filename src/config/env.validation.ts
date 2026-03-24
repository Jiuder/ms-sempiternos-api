import { plainToInstance, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync, Min, Max } from 'class-validator';

enum Environment {
  Development = 'develop',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  PORT: number;

  @IsString()
  REDIS_HOST: string;

  @Type(() => Number)
  @IsNumber()
  REDIS_PORT: number;

  @IsString()
  REDIS_URL: string;

  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @IsOptional()
  DUPLICATE_WINDOW_MS: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  TOP_ERRORS_K: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  @IsOptional()
  FILTER_HISTORY_MAX: number;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation error: ${errors.toString()}`);
  }
  return validatedConfig;
}
