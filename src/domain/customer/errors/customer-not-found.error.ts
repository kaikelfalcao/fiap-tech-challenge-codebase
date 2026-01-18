import { NotFoundError } from '@shared/errors/not-found.error';

export class CustomerNotFound extends NotFoundError {
  constructor() {
    super('Customer');
  }
}
