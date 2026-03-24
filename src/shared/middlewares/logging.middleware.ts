import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: () => void): void {
    res.on('finish', () => {
      if (req.originalUrl !== '/health' && req.originalUrl !== '/') {
        this.logger.log(
          JSON.stringify({
            message: 'request logged',
            stt: 'report',
            context: LoggingMiddleware.name,
            functionName: 'use',
            data: {
              requestedRoute: req.originalUrl,
              method: req.method,
              status: res.statusCode,
            },
          }),
        );
      }
    });

    next();
  }
}
