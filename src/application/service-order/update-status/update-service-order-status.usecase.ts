import { Inject, Injectable } from '@nestjs/common';
import type { ServiceOrderRepository } from '@domain/service-order/service-order.repository';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';
import type { ServiceOrderApprovalNotifier } from '@domain/notification/service-order-approval.notifier';

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
    @Inject('ServiceOrderApprovalNotifier')
    private readonly approvalNotifier: ServiceOrderApprovalNotifier,
  ) {}

  async execute(input: UpdateStatusInput): Promise<UpdateStatusOutput> {
    const order = await this.repository.findById(input.serviceOrderId);
    if (!order) throw new Error('Ordem de serviço não encontrada');

    order.changeStatus(input.newStatus);

    await this.repository.save(order);

    if (input.newStatus === ServiceOrderStatus.AwaitingApproval) {
      await this.approvalNotifier.notify(order);
    }

    return {
      updatedOrderId: order.id,
      newStatus: order.status,
    };
  }
}
