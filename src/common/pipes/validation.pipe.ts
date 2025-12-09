import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import {
  validate,
  ValidationError as ClassValidationError,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidationError } from '../errors/http.error';

type Constructor<T = unknown> = new (...args: unknown[]) => T;

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype as Constructor, value);
    const toValidateObj: object = object as object;
    const errors = await validate(toValidateObj, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    });

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new ValidationError('Validation failed', formattedErrors);
    }

    return object;
  }

  private toValidate(metatype: Constructor): boolean {
    const primitives: Constructor[] = [
      String as unknown as Constructor,
      Boolean as unknown as Constructor,
      Number as unknown as Constructor,
      Array as unknown as Constructor,
      Object as unknown as Constructor,
    ];
    return !primitives.includes(metatype);
  }

  private formatErrors(errors: ClassValidationError[]): Array<{
    field: string;
    errors: string[];
    children?: Array<{ field: string; errors: string[] }>;
  }> {
    return errors.map((error) => {
      const errs = error.constraints ? Object.values(error.constraints) : [];
      const children =
        error.children && error.children.length > 0
          ? this.formatErrors(error.children)
          : undefined;
      return {
        field: error.property,
        errors: errs,
        ...(children ? { children } : {}),
      };
    });
  }
}
