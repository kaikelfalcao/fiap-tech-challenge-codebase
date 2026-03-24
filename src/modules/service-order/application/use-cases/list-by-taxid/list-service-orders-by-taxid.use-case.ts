import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_ORDER_REPOSITORY,
  type IServiceOrderRepository,
  PaginatedResult,
} from '../../../domain/service-order.repository';
import { toServiceOrderOutput } from '../../helpers/service-order-output.mapper';
import type { GetServiceOrderOutput } from '../get/get-service-order.use-case';

import {
  CUSTOMER_PUBLIC_API,
  type ICustomerPublicApi,
} from '@/modules/customer/public/customer.public-api';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface ListServiceOrdersByTaxIdInput {
  taxId: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ListServiceOrdersByTaxIdUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orders: IServiceOrderRepository,
    @Inject(CUSTOMER_PUBLIC_API)
    private readonly customerApi: ICustomerPublicApi,
  ) {}

  async execute(
    input: ListServiceOrdersByTaxIdInput,
  ): Promise<PaginatedResult<GetServiceOrderOutput>> {
    const customer = await this.customerApi.getByTaxId(input.taxId);
    if (!customer) {
      throw new NotFoundException('Customer', input.taxId);
    }

    const result = await this.orders.list({
      customerId: customer.id,
      page: input.page,
      limit: input.limit,
    });

    return {
      ...result,
      data: result.data.map(toServiceOrderOutput),
    };
  }
}
