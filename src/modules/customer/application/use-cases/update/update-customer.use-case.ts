import { Inject, Injectable } from '@nestjs/common';

import { CustomerId } from '@/modules/customer/domain/customer-id.vo';
import {
  CUSTOMER_REPOSITORY,
  type ICustomerRepository,
} from '@/modules/customer/domain/customer.repository';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { Email } from '@/shared/domain/value-objects/email.vo';

export interface UpdateCustomerInput {
  id: string;
  fullName?: string;
  phone?: string;
  email?: string;
}

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: ICustomerRepository,
  ) {}

  async execute(input: UpdateCustomerInput): Promise<void> {
    const customer = await this.customers.findById(
      CustomerId.fromString(input.id),
    );
    if (!customer) {
      throw new NotFoundException('Customer', input.id);
    }

    customer.changeAttributes({
      fullName: input.fullName,
      phone: input.phone,
      email: input.email ? new Email(input.email) : undefined,
    });

    await this.customers.update(customer);
  }
}
