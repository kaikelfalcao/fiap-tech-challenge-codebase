import { ServiceOrderStatus } from 'src/domain/enums/service-order-status.enum';
import { UpdateServiceOrderStatusUseCase } from './update-service-order-status.usecase';
import { Injectable } from '@nestjs/common';

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
