import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_ORDER_REPOSITORY,
  type IServiceOrderRepository,
} from '../../../domain/service-order.repository';
import { ServiceOrderId } from '../../../domain/value-objects/service-order-id.vo';

import {
  INVENTORY_PUBLIC_API,
  type IInventoryPublicApi,
} from '@/modules/inventory/public/inventory.public-api';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { MetricsService } from '@/shared/infrastructure/metrics/metrics.service';

@Injectable()
export class ApproveBudgetUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orders: IServiceOrderRepository,
    @Inject(INVENTORY_PUBLIC_API)
    private readonly inventoryApi: IInventoryPublicApi,
    private readonly metrics: MetricsService,
  ) {}

  async execute(input: { orderId: string }): Promise<void> {
    const order = await this.orders.findById(
      ServiceOrderId.fromString(input.orderId),
    );
    if (!order) {
      throw new NotFoundException('ServiceOrder', input.orderId);
    }

    order.approve();

    // Reservar estoque de todos os itens ao aprovar
    for (const item of order.items) {
      await this.inventoryApi.reserveStock(
        item.itemId,
        item.quantity,
        order.id().value,
      );
    }

    await this.orders.update(order);

    this.metrics.recordBudgetApproved(order.id().value);
    this.metrics.recordServiceOrderStatusChanged(
      order.id().value,
      'AWAITING_APPROVAL',
      'IN_EXECUTION',
    );
  }
}
