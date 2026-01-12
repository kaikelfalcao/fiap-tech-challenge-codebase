import { Inject, Injectable } from '@nestjs/common';
import type { ServiceOrderRepository } from 'src/domain/repositories/service-order.repository';
import { ServiceOrderStatus } from 'src/domain/enums/service-order-status.enum';

export interface UpdateStatusInput {
  serviceOrderId: string;
  newStatus: ServiceOrderStatus;
}

export interface UpdateStatusOutput {
  updatedOrderId: string;
  newStatus: ServiceOrderStatus;
}

@Injectable()
export class UpdateServiceOrderStatusUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly repository: ServiceOrderRepository,
  ) {}

  async execute(input: UpdateStatusInput): Promise<UpdateStatusOutput> {
    const order = await this.repository.findById(input.serviceOrderId);
    if (!order) throw new Error('Ordem de serviço não encontrada');

    order.changeStatus(input.newStatus);

    await this.repository.save(order);

    return {
      updatedOrderId: order.id,
      newStatus: order.status,
    };
  }
}
