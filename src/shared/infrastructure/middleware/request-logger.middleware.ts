import { randomUUID } from 'crypto';

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
    const start = Date.now();

    res.setHeader('x-request-id', requestId);

    (req as any).requestId = requestId;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { method, originalUrl } = req;
      const { statusCode } = res;

      this.logger.log({
        message: `${method} ${originalUrl} ${statusCode} ${duration}ms`,
        requestId,
        method,
        url: originalUrl,
        statusCode,
        durationMs: duration,
        userAgent: req.headers['user-agent'],
      });
    });

    next();
  }
}
