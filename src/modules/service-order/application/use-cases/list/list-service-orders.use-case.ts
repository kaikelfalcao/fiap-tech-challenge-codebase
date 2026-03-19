import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_ORDER_REPOSITORY,
  type IServiceOrderRepository,
  PaginatedResult,
} from '../../../domain/service-order.repository';
import { SERVICE_ORDER_STATUS_LABEL } from '../../../domain/value-objects/service-order-status.vo';
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
      // Excluir finalizadas e entregues da listagem padrão
      excludeStatuses: ['FINALIZED', 'DELIVERED'],
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
