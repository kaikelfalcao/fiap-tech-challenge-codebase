import { NotFoundError } from '@shared/errors/not-found.error';

export class VehicleNotFound extends NotFoundError {
  constructor() {
    super('Vehicle');
  }
}
