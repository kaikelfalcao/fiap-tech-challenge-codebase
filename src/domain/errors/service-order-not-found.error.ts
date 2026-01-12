import { DomainError } from './domain.error';

export class ServiceOrderNotFound extends DomainError {
  readonly code = 'SERVICE_ORDER_NOT_FOUND';

  constructor() {
    super('Service Order not found');
  }
}
