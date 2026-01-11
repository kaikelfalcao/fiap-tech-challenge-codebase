import { DomainError } from './domain.error';

export class CustomerNotFound extends DomainError {
  readonly code = 'CUSTOMER_NOT_FOUND';

  constructor() {
    super('Customer not found');
  }
}
