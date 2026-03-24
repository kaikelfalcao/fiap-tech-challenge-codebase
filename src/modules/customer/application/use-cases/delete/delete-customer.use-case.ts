import { Inject, Injectable } from '@nestjs/common';

import { CustomerId } from '../../../domain/customer-id.vo';
import {
  CUSTOMER_REPOSITORY,
  type ICustomerRepository,
} from '../../../domain/customer.repository';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface DeleteCustomerInput {
  id: string;
}

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: ICustomerRepository,
  ) {}

  async execute(input: DeleteCustomerInput): Promise<void> {
    const customer = await this.customers.findById(
      CustomerId.fromString(input.id),
    );

    if (!customer) {
      throw new NotFoundException('Customer', input.id);
    }

    customer.ensureCanBeDeleted();

    await this.customers.delete(customer.id());
  }
}
