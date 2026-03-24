import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_ORDER_REPOSITORY,
  type IServiceOrderRepository,
} from '../../../domain/service-order.repository';
import { ServiceOrderId } from '../../../domain/value-objects/service-order-id.vo';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

export interface RemoveItemFromOrderInput {
  orderId: string;
  itemId: string;
}

@Injectable()
export class RemoveItemFromOrderUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orders: IServiceOrderRepository,
  ) {}

  async execute(input: RemoveItemFromOrderInput): Promise<void> {
    const order = await this.orders.findById(
      ServiceOrderId.fromString(input.orderId),
    );
    if (!order) {
      throw new NotFoundException('ServiceOrder', input.orderId);
    }

    try {
      order.removeItem(input.itemId);
    } catch (e) {
      throw new ValidationException((e as Error).message);
    }

    await this.orders.update(order);
  }
}
