import { Inject, Injectable } from '@nestjs/common';
import type { ServiceOrderRepository } from 'src/domain/repositories/service-order.repository';
import { ServiceOrder } from 'src/domain/entities/service-order.entity';
import { ServiceOrderNotFound } from 'src/domain/errors/service-order-not-found.error';

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
