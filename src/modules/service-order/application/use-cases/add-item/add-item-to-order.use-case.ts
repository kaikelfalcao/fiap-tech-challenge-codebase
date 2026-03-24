import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_ORDER_REPOSITORY,
  type IServiceOrderRepository,
} from '../../../domain/service-order.repository';
import { ServiceOrderId } from '../../../domain/value-objects/service-order-id.vo';
import { ServiceOrderItem } from '../../../domain/value-objects/service-order-item.vo';

import {
  INVENTORY_PUBLIC_API,
  type IInventoryPublicApi,
} from '@/modules/inventory/public/inventory.public-api';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

export interface AddItemToOrderInput {
  orderId: string;
  itemId: string;
  quantity: number;
}

@Injectable()
export class AddItemToOrderUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orders: IServiceOrderRepository,
    @Inject(INVENTORY_PUBLIC_API)
    private readonly inventoryApi: IInventoryPublicApi,
  ) {}

  async execute(input: AddItemToOrderInput): Promise<void> {
    const order = await this.orders.findById(
      ServiceOrderId.fromString(input.orderId),
    );
    if (!order) {
      throw new NotFoundException('ServiceOrder', input.orderId);
    }

    const inventoryItem = await this.inventoryApi.getItemById(input.itemId);
    if (!inventoryItem) {
      throw new NotFoundException('Item', input.itemId);
    }
    if (inventoryItem.stock.available < input.quantity) {
      throw new ValidationException(
        `Insufficient stock. Available: ${inventoryItem.stock.available}, requested: ${input.quantity}`,
      );
    }

    try {
      order.addItem(
        ServiceOrderItem.create({
          itemId: inventoryItem.id,
          name: inventoryItem.name,
          unitPriceCents: inventoryItem.unitPriceCents,
          quantity: input.quantity,
        }),
      );
    } catch (e) {
      throw new ValidationException((e as Error).message);
    }

    await this.orders.update(order);
  }
}
