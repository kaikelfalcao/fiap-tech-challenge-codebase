import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_ORDER_REPOSITORY,
  type IServiceOrderRepository,
} from '../../../domain/service-order.repository';
import { ServiceOrderId } from '../../../domain/value-objects/service-order-id.vo';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

@Injectable()
export class StartDiagnosisUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orders: IServiceOrderRepository,
  ) {}

  async execute(input: { orderId: string }): Promise<void> {
    const order = await this.orders.findById(
      ServiceOrderId.fromString(input.orderId),
    );
    if (!order) {
      throw new NotFoundException('ServiceOrder', input.orderId);
    }
    order.startDiagnosis();
    await this.orders.update(order);
  }
}
