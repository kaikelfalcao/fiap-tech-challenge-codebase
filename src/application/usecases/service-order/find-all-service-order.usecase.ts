import { Inject, Injectable } from '@nestjs/common';
import type { ServiceOrderRepository } from 'src/application/ports/service-order-repository';
import { ServiceOrder } from 'src/domain/entities/service-order.entity';

@Injectable()
export class FindAllServiceOrderUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly repo: ServiceOrderRepository,
  ) {}

  async execute(): Promise<ServiceOrder[]> {
    return await this.repo.findAll();
  }
}
