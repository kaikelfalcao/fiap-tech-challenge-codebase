import { Inject, Injectable } from '@nestjs/common';
import { Span } from 'nestjs-otel';
import type { ICustomerRepository } from '../../../domain/repositories/customer.repository';
import { Customer } from '../../../domain/entities/customer.entity';
import { CUSTOMER_REPOSITORY } from '../../../infrastructure/nest/modules/tokens';
import { UseCase } from '../../base.usecase';

export interface CreateCustomerInput {
  name: string;
  email: string;
  document: string;
}

@Injectable()
export class CreateCustomerUseCase extends UseCase<
  CreateCustomerInput,
  Customer
> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly repo: ICustomerRepository,
  ) {
    super();
  }

  @Span()
  async execute(input: CreateCustomerInput): Promise<Customer> {
    const customer = Customer.create(input);
    return this.repo.create(customer);
  }
}
