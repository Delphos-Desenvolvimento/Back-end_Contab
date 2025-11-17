import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError(error => {
          console.error('Error from error interceptor:', error);
          
          // Handle different types of errors
          if (error.name === 'ValidationError') {
            return throwError(() => new HttpException(
              { message: 'Validation failed', errors: error.errors },
              HttpStatus.BAD_REQUEST
            ));
          }
          
          if (error.name === 'UnauthorizedError') {
            return throwError(() => new HttpException(
              { message: 'Unauthorized' },
              HttpStatus.UNAUTHORIZED
            ));
          }
          
          // Default error response
          const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
          const message = error.message || 'Internal server error';
          
          return throwError(() => new HttpException(
            { statusCode: status, message, error: 'Http Exception' },
            status
          ));
        })
      );
  }
}
