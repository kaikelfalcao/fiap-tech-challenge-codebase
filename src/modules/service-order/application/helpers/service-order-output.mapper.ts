import type { ServiceOrder } from '../../domain/service-order.entity';
import { SERVICE_ORDER_STATUS_LABEL } from '../../domain/value-objects/service-order-status.vo';
import type { GetServiceOrderOutput } from '../use-cases/get/get-service-order.use-case';

import { Money } from '@/shared/domain/value-objects/money.vo';

export function toServiceOrderOutput(
  order: ServiceOrder,
): GetServiceOrderOutput {
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
      unitPriceFormatted: Money.fromCents(s.unitPriceCents).formatted,
      quantity: s.quantity,
      totalCents: s.totalCents,
      totalFormatted: Money.fromCents(s.totalCents).formatted,
    })),
    items: order.items.map((i) => ({
      itemId: i.itemId,
      name: i.name,
      unitPriceCents: i.unitPriceCents,
      unitPriceFormatted: Money.fromCents(i.unitPriceCents).formatted,
      quantity: i.quantity,
      totalCents: i.totalCents,
      totalFormatted: Money.fromCents(i.totalCents).formatted,
    })),
    totalServicesCents: order.totalServicesCents,
    totalServicesFormatted: Money.fromCents(order.totalServicesCents).formatted,
    totalItemsCents: order.totalItemsCents,
    totalItemsFormatted: Money.fromCents(order.totalItemsCents).formatted,
    totalCents: order.totalCents,
    totalFormatted: Money.fromCents(order.totalCents).formatted,
    budgetSentAt: order.budgetSentAt,
    approvedAt: order.approvedAt,
    rejectedAt: order.rejectedAt,
    finalizedAt: order.finalizedAt,
    deliveredAt: order.deliveredAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
