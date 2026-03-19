import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { DomainException } from '@/shared/domain/domain.exception';
import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { ConflictException } from '@/shared/domain/exceptions/conflict.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
}

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = this.resolveStatus(exception);

    const body: ErrorResponse = {
      statusCode,
      error: exception.name,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (statusCode >= 500) {
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.warn(`${exception.name}: ${exception.message}`);
    }

    response.status(statusCode).json(body);
  }

  private resolveStatus(exception: DomainException): number {
    if (exception instanceof NotFoundException) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof ConflictException) {
      return HttpStatus.CONFLICT;
    }
    if (exception instanceof ValidationException) {
      return HttpStatus.UNPROCESSABLE_ENTITY;
    }
    if (exception instanceof BusinessRuleException) {
      return HttpStatus.UNPROCESSABLE_ENTITY;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
