import { registerAs } from '@nestjs/config';

const safeParseInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
};

export default registerAs('config', () => {
  const nodeEnv = process.env.NODE_ENV || 'develop';

  return {
    environment: nodeEnv,
    app: {
      port: safeParseInt(process.env.PORT, 3000),
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: safeParseInt(process.env.REDIS_PORT, 6379),
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    logStream: {
      duplicateWindowMs: safeParseInt(process.env.DUPLICATE_WINDOW_MS, 60000),
      topErrorsK: safeParseInt(process.env.TOP_ERRORS_K, 10),
      filterHistoryMax: safeParseInt(process.env.FILTER_HISTORY_MAX, 50),
    },
  };
});
