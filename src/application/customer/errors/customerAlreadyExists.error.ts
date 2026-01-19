import { DomainError } from '@domain/errors/domain.error';

export class CustomerAlreadyExistsError extends DomainError {
  constructor() {
    super('Customer already exists', 'CUSTOMER_ALREADY_EXISTS', 400);
  }
}
