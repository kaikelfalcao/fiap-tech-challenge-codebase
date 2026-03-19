import { Inject, Injectable } from '@nestjs/common';

import { CustomerId } from '@/modules/customer/domain/customer-id.vo';
import {
  CUSTOMER_REPOSITORY,
  type ICustomerRepository,
} from '@/modules/customer/domain/customer.repository';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface DeactivateCustomerInput {
  id: string;
}

@Injectable()
export class DeactivateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: ICustomerRepository,
  ) {}

  async execute(input: DeactivateCustomerInput): Promise<void> {
    const customer = await this.customers.findById(
      CustomerId.fromString(input.id),
    );
    if (!customer) {
      throw new NotFoundException('Customer', input.id);
    }

    customer.deactivate();
    await this.customers.update(customer);
  }
}
