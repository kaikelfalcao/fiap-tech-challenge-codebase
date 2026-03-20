import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_ORDER_REPOSITORY,
  type IServiceOrderRepository,
} from '../../../domain/service-order.repository';
import { ServiceOrderId } from '../../../domain/value-objects/service-order-id.vo';
import type { ServiceOrderStatus } from '../../../domain/value-objects/service-order-status.vo';
import { toServiceOrderOutput } from '../../helpers/service-order-output.mapper';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface ServiceOrderServiceOutput {
  serviceId: string;
  name: string;
  unitPriceCents: number;
  unitPriceFormatted: string;
  quantity: number;
  totalCents: number;
  totalFormatted: string;
}

export interface ServiceOrderItemOutput {
  itemId: string;
  name: string;
  unitPriceCents: number;
  unitPriceFormatted: string;
  quantity: number;
  totalCents: number;
  totalFormatted: string;
}
export interface GetServiceOrderOutput {
  id: string;
  customerId: string;
  vehicleId: string;
  status: ServiceOrderStatus;
  statusLabel: string;
  services: ServiceOrderServiceOutput[];
  items: ServiceOrderItemOutput[];
  totalServicesCents: number;
  totalServicesFormatted: string;
  totalItemsCents: number;
  totalItemsFormatted: string;
  totalCents: number;
  totalFormatted: string;
  budgetSentAt: Date | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  finalizedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetServiceOrderUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orders: IServiceOrderRepository,
  ) {}

  async execute(input: { id: string }): Promise<GetServiceOrderOutput> {
    const order = await this.orders.findById(
      ServiceOrderId.fromString(input.id),
    );
    if (!order) {
      throw new NotFoundException('ServiceOrder', input.id);
    }
    return toServiceOrderOutput(order);
  }
}
