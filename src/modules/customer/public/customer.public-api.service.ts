import { Inject, Injectable } from '@nestjs/common';

import { CustomerId } from '../domain/customer-id.vo';
import {
  CUSTOMER_REPOSITORY,
  type ICustomerRepository,
} from '../domain/customer.repository';
import { TaxId } from '../domain/tax-id.vo';

import type { CustomerView, ICustomerPublicApi } from './customer.public-api';

@Injectable()
export class CustomerPublicApiService implements ICustomerPublicApi {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: ICustomerRepository,
  ) {}

  async getByTaxId(taxId: string): Promise<CustomerView | null> {
    let parsed: TaxId;
    try {
      parsed = TaxId.create(taxId);
    } catch {
      return null;
    }

    const customer = await this.customers.findByTaxId(parsed);
    if (!customer) {
      return null;
    }

    return {
      id: customer.id().value,
      taxId: customer.taxId.formatted,
      taxIdType: customer.taxId.type,
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email.getValue(),
      active: customer.active,
    };
  }

  async getById(customerId: string): Promise<CustomerView | null> {
    let parsed: CustomerId;

    try {
      parsed = CustomerId.fromString(customerId);
    } catch {
      return null;
    }

    const customer = await this.customers.findById(parsed);
    if (!customer) {
      return null;
    }

    return {
      id: customer.id().value,
      taxId: customer.taxId.formatted,
      taxIdType: customer.taxId.type,
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email.getValue(),
      active: customer.active,
    };
  }
}
