import { Inject, Injectable } from '@nestjs/common';
import type { ServiceOrderRepository } from '@domain/service-order/service-order.repository';
import { ServiceOrder } from '@domain/service-order/service-order.entity';

@Injectable()
export class ListServiceOrderUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly repo: ServiceOrderRepository,
  ) {}

  async execute(): Promise<ServiceOrder[]> {
    return await this.repo.findAll();
  }
}
