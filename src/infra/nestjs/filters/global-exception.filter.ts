import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from 'src/domain/errors/domain.error';
import { ERROR_STATUS_MAP } from 'src/interface/http/error-status.map';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    console.log(exception);
    if (exception instanceof DomainError) {
      const status = ERROR_STATUS_MAP[exception.code] ?? HttpStatus.BAD_REQUEST;

      return res.status(status).json({
        error: {
          code: exception.code,
          message: exception.message,
        },
      });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected error',
      },
    });
  }
}
