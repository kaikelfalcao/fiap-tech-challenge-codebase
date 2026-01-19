import { ApplicationError } from '@application/errors/application.error';

export class InsufficientStockPort extends ApplicationError {
  constructor(message) {
    super(message, 'INSUFFICIENT_STOCK', 400);
  }
}
