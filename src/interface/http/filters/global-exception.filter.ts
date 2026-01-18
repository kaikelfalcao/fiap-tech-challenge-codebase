import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseError } from '@shared/errors/base.error';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof BaseError) {
      return res.status(exception.httpStatus ?? 500).json({
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

    console.error(exception);

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected error',
      },
    });
  }
}
