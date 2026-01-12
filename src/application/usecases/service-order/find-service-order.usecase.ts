import { Inject, Injectable } from '@nestjs/common';
import type { ServiceOrderRepository } from 'src/domain/repositories/service-order.repository';
import { ServiceOrder } from 'src/domain/entities/service-order.entity';

@Injectable()
export class FindServiceOrderUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly repo: ServiceOrderRepository,
  ) {}

  async execute(input: { id: string }): Promise<ServiceOrder> {
    return await this.repo.findById(input.id);
  }
}
