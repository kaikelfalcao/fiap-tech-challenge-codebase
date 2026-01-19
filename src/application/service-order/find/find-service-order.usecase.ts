import { Inject, Injectable } from '@nestjs/common';
import type { ServiceOrderRepository } from '@domain/service-order/service-order.repository';
import { ServiceOrder } from '@domain/service-order/service-order.entity';
import { ServiceOrderNotFound } from '@domain/service-order/service-order-not-found.error';

@Injectable()
export class FindServiceOrderUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly repo: ServiceOrderRepository,
  ) {}

  async execute(input: { id: string }): Promise<ServiceOrder> {
    const order = await this.repo.findById(input.id);

    if (!order) {
      throw new ServiceOrderNotFound();
    }

    return order;
  }
}
