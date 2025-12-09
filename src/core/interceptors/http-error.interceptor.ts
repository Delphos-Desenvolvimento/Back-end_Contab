import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        const errObj =
          typeof error === 'object' && error !== null
            ? (error as Record<string, unknown>)
            : {};

        const name = typeof errObj['name'] === 'string' ? errObj['name'] : '';
        if (name === 'ValidationError') {
          const errors = Array.isArray(errObj['errors'])
            ? (errObj['errors'] as unknown[])
            : [];
          return throwError(
            () =>
              new HttpException(
                { message: 'Validation failed', errors },
                HttpStatus.BAD_REQUEST,
              ),
          );
        }

        if (name === 'UnauthorizedError') {
          return throwError(
            () =>
              new HttpException(
                { message: 'Unauthorized' },
                HttpStatus.UNAUTHORIZED,
              ),
          );
        }

        const status =
          error instanceof HttpException
            ? error.getStatus()
            : typeof errObj['status'] === 'number'
              ? errObj['status']
              : HttpStatus.INTERNAL_SERVER_ERROR;
        const message =
          typeof errObj['message'] === 'string'
            ? errObj['message']
            : 'Internal server error';

        return throwError(
          () =>
            new HttpException(
              { statusCode: status, message, error: 'Http Exception' },
              status,
            ),
        );
      }),
    );
  }
}
