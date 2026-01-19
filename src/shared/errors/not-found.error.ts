import { DomainError } from '../../domain/errors/domain.error';

export class NotFoundError extends DomainError {
  constructor(entity: string) {
    super(`${entity} not found`, 'NOT_FOUND', 404);
  }
}
