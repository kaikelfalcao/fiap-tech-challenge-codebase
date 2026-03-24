import { Inject, Injectable } from '@nestjs/common';

import { CustomerId } from '@/modules/customer/domain/customer-id.vo';
import { Customer } from '@/modules/customer/domain/customer.entity';
import {
  CUSTOMER_REPOSITORY,
  type ICustomerRepository,
} from '@/modules/customer/domain/customer.repository';
import { TaxId } from '@/modules/customer/domain/tax-id.vo';
import { ConflictException } from '@/shared/domain/exceptions/conflict.exception';
import { Email } from '@/shared/domain/value-objects/email.vo';

export interface RegisterCustomerInput {
  taxId: string;
  fullName: string;
  phone: string;
  email: string;
}

export interface RegisterCustomerOutput {
  id: string;
}

@Injectable()
export class RegisterCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: ICustomerRepository,
  ) {}

  async execute(input: RegisterCustomerInput): Promise<RegisterCustomerOutput> {
    const taxId = TaxId.create(input.taxId);

    const alreadyExists = await this.customers.existsByTaxId(taxId);
    if (alreadyExists) {
      throw new ConflictException('A customer with this tax ID already exists');
    }

    const customer = Customer.create({
      id: CustomerId.generate(),
      taxId,
      fullName: input.fullName,
      phone: input.phone,
      email: new Email(input.email),
    });

    await this.customers.save(customer);

    return { id: customer.id().value };
  }
}
