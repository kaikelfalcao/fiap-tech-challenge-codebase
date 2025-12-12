import { Inject, Injectable } from '@nestjs/common';
import { Span } from 'nestjs-otel';
import type { ICustomerRepository } from '../../../domain/repositories/customer.repository';
import { CUSTOMER_REPOSITORY } from '../../../infrastructure/nest/modules/tokens';
import { Customer } from '../../../domain/entities/customer.entity';
import { UUID } from 'node:crypto';
import { UseCase } from '../../base.usecase';

export interface UpdateCustomerInput {
  id: UUID;
  name?: string;
  email?: string;
  document?: string;
}

@Injectable()
export class UpdateCustomerUseCase extends UseCase<
  UpdateCustomerInput,
  Customer
> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly repo: ICustomerRepository,
  ) {
    super();
  }

  @Span()
  async execute(input: UpdateCustomerInput): Promise<Customer> {
    const found = await this.repo.findById(input.id);
    if (!found) throw new Error('Customer not found');

    if (input.name) found.name = input.name;
    if (input.email) found.email = input.email;
    if (input.document) found.document = input.document;

    return this.repo.update(found);
  }
}
