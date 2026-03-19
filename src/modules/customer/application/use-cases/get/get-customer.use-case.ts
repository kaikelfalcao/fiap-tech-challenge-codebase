import { Inject, Injectable } from '@nestjs/common';

import { CustomerId } from '@/modules/customer/domain/customer-id.vo';
import {
  CUSTOMER_REPOSITORY,
  type ICustomerRepository,
} from '@/modules/customer/domain/customer.repository';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface GetCustomerInput {
  id: string;
}

export interface GetCustomerOutput {
  id: string;
  taxId: string;
  taxIdType: 'CPF' | 'CNPJ';
  fullName: string;
  phone: string;
  email: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: ICustomerRepository,
  ) {}

  async execute(input: GetCustomerInput): Promise<GetCustomerOutput> {
    const customer = await this.customers.findById(
      CustomerId.fromString(input.id),
    );
    if (!customer) {
      throw new NotFoundException('Customer', input.id);
    }

    return {
      id: customer.id().value,
      taxId: customer.taxId.formatted,
      taxIdType: customer.taxId.type,
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email.getValue(),
      active: customer.active,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
