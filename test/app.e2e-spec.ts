import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const RedisMock = require('ioredis-mock');
import { AppModule } from '@src/app.module';
import { REDIS_CLIENT } from '@redis/redis.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.REDIS_HOST = 'localhost';
    process.env.REDIS_PORT = '6379';
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.PORT = '3000';
    process.env.DUPLICATE_WINDOW_MS = '5000';
    process.env.TOP_ERRORS_K = '10';
    process.env.FILTER_HISTORY_MAX = '20';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(REDIS_CLIENT)
      .useValue(new RedisMock())
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/logs/ingest/stream (POST) - should ingest a stream of logs', async () => {
    const logData = '{"level":"INFO","service":"test","message":"e2e test"}\n';

    const response = await request(app.getHttpServer())
      .post('/logs/ingest/stream')
      .set('Content-Type', 'application/octet-stream')
      .send(Buffer.from(logData));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('processed', 1);
    expect(response.body).toHaveProperty('duplicates', 0);
  });

  it('/stats/summary (GET) - should return log counts', async () => {
    const response = await request(app.getHttpServer()).get('/stats/summary');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('infoCount');
  });
});
