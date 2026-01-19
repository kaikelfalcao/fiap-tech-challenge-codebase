import { NotFoundError } from '@shared/errors/not-found.error';

export class ServiceOrderNotFound extends NotFoundError {
  constructor() {
    super('Service Order');
  }
}
