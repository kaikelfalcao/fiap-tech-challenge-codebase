import { DomainError } from './domain.error';

export class InvalidRegistrationNumber extends DomainError {
  readonly code = 'INVALID_REGISTRATION_NUMBER';

  constructor(value: string) {
    super(`Invalid registration number: ${value}`);
  }
}
