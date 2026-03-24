import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';

const newrelic = require('newrelic');

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const status = ctx.switchToHttp().getResponse().statusCode;

        newrelic.recordMetric(`Custom/API/Latency/${method}`, duration);

        newrelic.addCustomAttributes({
          'http.method': method,
          'http.url': url,
          'http.status_code': status,
          'http.duration_ms': duration,
        });
      }),
      catchError((error) => {
        const duration = Date.now() - start;

        newrelic.noticeError(error, {
          'http.method': method,
          'http.url': url,
          'http.duration_ms': duration,
        });

        newrelic.incrementMetric('Custom/API/Errors');

        return throwError(() => error);
      }),
    );
  }
}
