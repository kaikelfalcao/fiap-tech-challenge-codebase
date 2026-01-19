import { ApplicationError } from '../../application/errors/application.error';

export class InvalidInputError extends ApplicationError {
  constructor(message: string) {
    super(message, 'INVALID_INPUT', 400);
  }
}
