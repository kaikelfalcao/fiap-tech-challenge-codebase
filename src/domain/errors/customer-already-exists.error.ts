import { DomainError } from './domain.error';

export class CustomerAlreadyExistsError extends DomainError {
  readonly code = 'CUSTOMER_ALREADY_EXISTS';

  constructor() {
    super('Customer already exists');
  }
}
