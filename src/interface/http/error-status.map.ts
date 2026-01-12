import { HttpStatus } from '@nestjs/common';

export const ERROR_STATUS_MAP: Record<string, HttpStatus> = {
  INVALID_EMAIL: HttpStatus.BAD_REQUEST,
  INVALID_REGISTRATION_NUMBER: HttpStatus.BAD_REQUEST,

  CUSTOMER_ALREADY_EXISTS: HttpStatus.CONFLICT,

  CUSTOMER_NOT_FOUND: HttpStatus.NOT_FOUND,

  UNAUTHORIZED_OPERATION: HttpStatus.FORBIDDEN,
};
