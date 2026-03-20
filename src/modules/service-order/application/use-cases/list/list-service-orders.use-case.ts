import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_ORDER_REPOSITORY,
  type IServiceOrderRepository,
  PaginatedResult,
} from '../../../domain/service-order.repository';
import { toServiceOrderOutput } from '../../helpers/service-order-output.mapper';
import type { GetServiceOrderOutput } from '../get/get-service-order.use-case';

export interface ListServiceOrdersInput {
  customerId?: string;
  vehicleId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ListServiceOrdersUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orders: IServiceOrderRepository,
  ) {}

  async execute(
    input: ListServiceOrdersInput,
  ): Promise<PaginatedResult<GetServiceOrderOutput>> {
    const result = await this.orders.list({
      ...input,
      excludeStatuses: ['FINALIZED', 'DELIVERED'],
    });

    return {
      ...result,
      data: result.data.map(toServiceOrderOutput),
    };
  }
}
