import { Inject, Injectable } from '@nestjs/common';

import { GetCustomerOutput } from '../get/get-customer.use-case';

import {
  CUSTOMER_REPOSITORY,
  type ICustomerRepository,
  PaginatedResult,
} from '@/modules/customer/domain/customer.repository';

export interface ListCustomersInput {
  active?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class ListCustomersUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: ICustomerRepository,
  ) {}

  async execute(
    input: ListCustomersInput,
  ): Promise<PaginatedResult<GetCustomerOutput>> {
    const result = await this.customers.list(input);

    return {
      ...result,
      data: result.data.map((customer) => ({
        id: customer.id().value,
        taxId: customer.taxId.formatted,
        taxIdType: customer.taxId.type,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email.getValue(),
        active: customer.active,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      })),
    };
  }
}
