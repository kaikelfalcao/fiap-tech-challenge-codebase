import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_ORDER_REPOSITORY,
  type IServiceOrderRepository,
} from '../../../domain/service-order.repository';
import { ServiceOrderId } from '../../../domain/value-objects/service-order-id.vo';
import { SERVICE_ORDER_STATUS_LABEL } from '../../../domain/value-objects/service-order-status.vo';
import type { ServiceOrderStatus } from '../../../domain/value-objects/service-order-status.vo';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface ServiceOrderServiceOutput {
  serviceId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  totalCents: number;
}

export interface ServiceOrderItemOutput {
  itemId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  totalCents: number;
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
  totalItemsCents: number;
  totalCents: number;
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
    return {
      id: order.id().value,
      customerId: order.customerId,
      vehicleId: order.vehicleId,
      status: order.status,
      statusLabel: SERVICE_ORDER_STATUS_LABEL[order.status],
      services: order.services.map((s) => ({
        serviceId: s.serviceId,
        name: s.name,
        unitPriceCents: s.unitPriceCents,
        quantity: s.quantity,
        totalCents: s.totalCents,
      })),
      items: order.items.map((i) => ({
        itemId: i.itemId,
        name: i.name,
        unitPriceCents: i.unitPriceCents,
        quantity: i.quantity,
        totalCents: i.totalCents,
      })),
      totalServicesCents: order.totalServicesCents,
      totalItemsCents: order.totalItemsCents,
      totalCents: order.totalCents,
      budgetSentAt: order.budgetSentAt,
      approvedAt: order.approvedAt,
      rejectedAt: order.rejectedAt,
      finalizedAt: order.finalizedAt,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
