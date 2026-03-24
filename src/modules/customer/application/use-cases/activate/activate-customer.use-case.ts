import { Inject, Injectable } from '@nestjs/common';

import { CustomerId } from '@/modules/customer/domain/customer-id.vo';
import {
  CUSTOMER_REPOSITORY,
  type ICustomerRepository,
} from '@/modules/customer/domain/customer.repository';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface ActivateCustomerInput {
  id: string;
}

@Injectable()
export class ActivateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: ICustomerRepository,
  ) {}

  async execute(input: ActivateCustomerInput): Promise<void> {
    const customer = await this.customers.findById(
      CustomerId.fromString(input.id),
    );
    if (!customer) {
      throw new NotFoundException('Customer', input.id);
    }

    customer.activate();
    await this.customers.update(customer);
  }
}
