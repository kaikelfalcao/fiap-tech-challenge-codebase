import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from 'src/domain/errors/domain.error';
import { ERROR_STATUS_MAP } from 'src/interface/http/error-status.map';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof DomainError) {
      const status = ERROR_STATUS_MAP[exception.code] ?? HttpStatus.BAD_REQUEST;

      return res.status(status).json({
        error: {
          code: exception.code,
          message: exception.message,
        },
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      return res
        .status(status)
        .json(
          typeof response === 'string'
            ? { error: { message: response } }
            : response,
        );
    }

    this.logger.error(
      'Unexpected error',
      exception instanceof Error ? exception.stack : undefined,
    );

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected error',
      },
    });
  }
}
