import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';
import { Injectable } from '@nestjs/common';
import { UpdateServiceOrderStatusUseCase } from '../update-status/update-service-order-status.usecase';

@Injectable()
export class ApproveServiceOrderByEmailUseCase {
  constructor(private readonly updateStatus: UpdateServiceOrderStatusUseCase) {}

  async execute(input: { serviceOrderId: string; approved: boolean }) {
    await this.updateStatus.execute({
      serviceOrderId: input.serviceOrderId,
      newStatus: input.approved
        ? ServiceOrderStatus.InProgress
        : ServiceOrderStatus.Canceled,
    });
  }
}
