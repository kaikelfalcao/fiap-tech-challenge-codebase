import { DomainError } from './domain.error';

export class InvalidEmailError extends DomainError {
  readonly code = 'INVALID_EMAIL';

  constructor(value: string) {
    super(`Invalid email: ${value}`);
  }
}
