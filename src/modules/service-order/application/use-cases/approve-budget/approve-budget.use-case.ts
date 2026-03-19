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

@Injectable()
export class ApproveBudgetUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orders: IServiceOrderRepository,
    @Inject(INVENTORY_PUBLIC_API)
    private readonly inventoryApi: IInventoryPublicApi,
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
  }
}
