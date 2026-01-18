import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl } = request;

    const start = Date.now();

    this.logger.log(`[Request] START ${method} ${originalUrl}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;

        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;

        this.logger.log(
          `[Request] END ${method} ${originalUrl} ${statusCode} +${duration}ms`,
        );
      }),
    );
  }
}
