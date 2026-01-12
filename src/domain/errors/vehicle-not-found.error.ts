import { DomainError } from './domain.error';

export class VehicleNotFound extends DomainError {
  readonly code = 'Vehicle_NOT_FOUND';

  constructor() {
    super('Vehicle not found');
  }
}
