import { Inject, Injectable } from '@nestjs/common';
import type { ServiceOrderRepository } from 'src/domain/repositories/service-order.repository';

@Injectable()
export class DeleteServiceOrderUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly repo: ServiceOrderRepository,
  ) {}

  async execute(input: { id: string }): Promise<void> {
    const order = await this.repo.findById(input.id);
    if (!order) throw new Error('Order not found');

    await this.repo.delete(input.id);
  }
}
