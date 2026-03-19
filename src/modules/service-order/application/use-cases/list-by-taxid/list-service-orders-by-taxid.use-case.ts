import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_ORDER_REPOSITORY,
  type IServiceOrderRepository,
  PaginatedResult,
} from '../../../domain/service-order.repository';
import { SERVICE_ORDER_STATUS_LABEL } from '../../../domain/value-objects/service-order-status.vo';
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

    // Cliente vê TODAS as suas OS, incluindo finalizadas e entregues
    const result = await this.orders.list({
      customerId: customer.id,
      page: input.page,
      limit: input.limit,
    });

    return {
      ...result,
      data: result.data.map((order) => ({
        id: order.id().value,
        customerId: order.customerId,
        vehicleId: order.vehicleId,
        status: order.status,
        statusLabel: SERVICE_ORDER_STATUS_LABEL[order.status],
        services: order.services.map((s) => ({
          serviceId: s.serviceId,
          name: s.name,
          unitPriceCents: s.unitPriceCents,
          quantity: s.quantity,
          totalCents: s.totalCents,
        })),
        items: order.items.map((i) => ({
          itemId: i.itemId,
          name: i.name,
          unitPriceCents: i.unitPriceCents,
          quantity: i.quantity,
          totalCents: i.totalCents,
        })),
        totalServicesCents: order.totalServicesCents,
        totalItemsCents: order.totalItemsCents,
        totalCents: order.totalCents,
        budgetSentAt: order.budgetSentAt,
        approvedAt: order.approvedAt,
        rejectedAt: order.rejectedAt,
        finalizedAt: order.finalizedAt,
        deliveredAt: order.deliveredAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    };
  }
}
