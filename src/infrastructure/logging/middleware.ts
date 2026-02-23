import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Gerar um request ID único para rastreamento
    const requestId = req.headers['x-request-id'] || uuidv4();
    req['requestId'] = requestId;
    res.setHeader('x-request-id', String(requestId));

    // Capturar o momento do início da requisição
    const startTime = Date.now();

    // Adicionar request_id aos logs para correlação no New Relic
    const logMeta = {
      requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    // Log da requisição recebida
    logger.info(`[${requestId}] Incoming request`, {
      ...logMeta,
      query: req.query,
    });

    // Interceptar a resposta
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      const logLevel =
        statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

      logger.log(logLevel, `[${requestId}] Request completed`, {
        ...logMeta,
        statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('content-length') || 0,
      });
    });

    // Interceptar erros de conexão
    res.on('close', () => {
      if (!res.headersSent) {
        logger.warn(`[${requestId}] Request closed without response`, logMeta);
      }
    });

    next();
  }
}
