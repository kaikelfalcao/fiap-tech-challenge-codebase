import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ICustomerRepository } from '../../../domain/repositories/customer.repository';
import { CUSTOMER_REPOSITORY } from '../../../infrastructure/nest/modules/tokens';
import { Customer } from '../../../domain/entities/customer.entity';
import type { UUID } from 'node:crypto';
import { UseCase } from '../../base.usecase';
import { Span } from 'nestjs-otel';

@Injectable()
export class GetCustomerUseCase extends UseCase<UUID, Customer> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly repo: ICustomerRepository,
  ) {
    super();
  }

  @Span()
  async execute(id: string): Promise<Customer> {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException();
    return found;
  }
}
