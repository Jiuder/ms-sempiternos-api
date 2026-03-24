import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from '@src/app.module';
import { setupSwagger } from '@swagger/swagger.config';
import { AllExceptionsFilter } from '@shared/filters/all-exceptions.filter';
import * as express from 'express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const expressApp = app.getHttpAdapter().getInstance() as express.Application;

  expressApp.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.url === '/logs/ingest/stream') {
      next();
    } else {
      express.json({ limit: '50mb' })(req, res, next);
    }
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('config.app.port');
  setupSwagger(app, port);

  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`Application running on http://localhost:${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

void bootstrap();
