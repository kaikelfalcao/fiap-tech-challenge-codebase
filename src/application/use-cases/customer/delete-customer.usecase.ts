import { Inject, Injectable } from '@nestjs/common';
import type { ICustomerRepository } from '../../../domain/repositories/customer.repository';
import type { UUID } from 'node:crypto';
import { CUSTOMER_REPOSITORY } from '../../../infrastructure/nest/modules/tokens';
import { UseCase } from '../../base.usecase';
import { Span } from 'nestjs-otel';

@Injectable()
export class DeleteCustomerUseCase extends UseCase<UUID, boolean> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly repo: ICustomerRepository,
  ) {
    super();
  }

  @Span()
  async execute(id: string): Promise<boolean> {
    await this.repo.delete(id);
    return true;
  }
}
