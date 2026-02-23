import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { logger } from '@infrastructure/logging/logger';

/**
 * Interceptor de Logging Avançado
 *
 * Responsabilidades:
 * - Log INFO: Requisições normais + payloads
 * - Log WARN: Requisições com warnings + payloads
 * - Log ERROR: Erros + payloads completos
 *
 * Recursos:
 * - Captura payload da request (body)
 * - Captura response data
 * - Rastreia duração da operação
 * - Correlaciona com requestId
 * - Sanitiza dados sensíveis
 */

interface RequestInfo {
  method: string;
  path: string;
  url: string;
  requestId: string;
  ip: string;
  userAgent?: string;
  body?: any;
  query?: any;
  params?: any;
  duration?: number;
  statusCode?: number;
  responseSize?: number;
}

@Injectable()
export class AdvancedLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const requestInfo = this.buildRequestInfo(request);
    const startTime = Date.now();

    // Log da requisição recebida (INFO)
    this.logRequestReceived(requestInfo);

    return next.handle().pipe(
      tap((responseData) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Completar informações
        requestInfo.duration = duration;
        requestInfo.statusCode = statusCode;
        requestInfo.responseSize = JSON.stringify(responseData || {}).length;

        // Log da resposta baseado no status code
        this.logResponse(requestInfo, responseData, statusCode);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        requestInfo.duration = duration;
        requestInfo.statusCode = error.status || 500;

        // Log de erro
        this.logError(requestInfo, error);

        throw error;
      }),
    );
  }

  /**
   * Constrói as informações da requisição
   */
  private buildRequestInfo(request: any): RequestInfo {
    return {
      method: request.method,
      path: request.path,
      url: request.originalUrl,
      requestId: request.headers['x-request-id'] || 'N/A',
      ip: request.ip || request.connection.remoteAddress,
      userAgent: request.headers['user-agent'],
      body: this.sanitizePayload(request.body),
      query: request.query,
      params: request.params,
    };
  }

  /**
   * Sanitiza dados sensíveis do payload
   */
  private sanitizePayload(body: any): any {
    if (!body) return undefined;

    const sanitized = JSON.parse(JSON.stringify(body));

    // Campos sensíveis a mascarar
    const sensitiveFields = [
      'password',
      'token',
      'access_token',
      'refresh_token',
      'creditCard',
      'ssn',
      'secret',
      'apiKey',
    ];

    this.maskSensitiveFields(sanitized, sensitiveFields);

    return sanitized;
  }

  /**
   * Mascara campos sensíveis recursivamente
   */
  private maskSensitiveFields(obj: any, sensitiveFields: string[]): void {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (
        sensitiveFields.some((field) =>
          key.toLowerCase().includes(field.toLowerCase()),
        )
      ) {
        obj[key] = '***MASKED***';
      } else if (typeof obj[key] === 'object') {
        this.maskSensitiveFields(obj[key], sensitiveFields);
      }
    }
  }

  /**
   * Log de requisição recebida (INFO)
   */
  private logRequestReceived(info: RequestInfo): void {
    logger.info(`[REQUEST] ${info.method} ${info.path}`, {
      requestId: info.requestId,
      method: info.method,
      path: info.path,
      url: info.url,
      ip: info.ip,
      userAgent: info.userAgent,
      // Payload da requisição
      payload: {
        body: info.body,
        query: info.query,
        params: info.params,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log de resposta baseado no status code
   */
  private logResponse(
    info: RequestInfo,
    responseData: any,
    statusCode: number,
  ): void {
    const level = this.getLogLevel(statusCode);
    const sanitizedResponse = this.sanitizePayload(responseData);

    const logMessage = `[RESPONSE] ${info.method} ${info.path} - ${statusCode}`;
    const logContext = {
      requestId: info.requestId,
      method: info.method,
      path: info.path,
      statusCode: statusCode,
      duration: `${info.duration}ms`,
      responseSize: `${info.responseSize}B`,
      // Payload da request
      request: {
        body: info.body,
        query: info.query,
        params: info.params,
      },
      // Payload da response
      response: sanitizedResponse,
      timestamp: new Date().toISOString(),
    };

    if (level === 'warn') {
      logger.warn(logMessage, logContext);
    } else if (level === 'error') {
      logger.error(logMessage, logContext);
    } else {
      logger.info(logMessage, logContext);
    }
  }

  /**
   * Log de erro
   */
  private logError(info: RequestInfo, error: any): void {
    const sanitizedResponse = this.sanitizePayload(error.getResponse?.());

    logger.error(
      `[ERROR] ${info.method} ${info.path} - ${error.status || 500}`,
      {
        requestId: info.requestId,
        method: info.method,
        path: info.path,
        statusCode: error.status || 500,
        duration: `${info.duration}ms`,
        errorType: error.constructor.name,
        errorMessage: error.message,
        errorCode: error.code,
        stack: error.stack,
        // Payload da request que causou erro
        request: {
          body: info.body,
          query: info.query,
          params: info.params,
        },
        // Response de erro
        errorResponse: sanitizedResponse,
        timestamp: new Date().toISOString(),
      },
    );
  }

  /**
   * Determina o nível de log baseado no status code
   */
  private getLogLevel(statusCode: number): 'info' | 'warn' | 'error' {
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';
    return 'info';
  }
}
