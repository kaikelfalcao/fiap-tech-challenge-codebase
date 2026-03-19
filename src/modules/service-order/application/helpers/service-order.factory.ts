import { ServiceOrder } from '../../domain/service-order.entity';
import type { ServiceOrderProps } from '../../domain/service-order.entity';
import { ServiceOrderId } from '../../domain/value-objects/service-order-id.vo';
import { ServiceOrderItem } from '../../domain/value-objects/service-order-item.vo';
import { ServiceOrderService } from '../../domain/value-objects/service-order-service.vo';
import type { ServiceOrderStatus } from '../../domain/value-objects/service-order-status.vo';

export const SO_UUID_1 = 'a1a2a3a4-0001-4000-8000-000000000001';
export const SO_UUID_2 = 'a1a2a3a4-0002-4000-8000-000000000002';
export const CUSTOMER_UUID = 'b1b2b3b4-0001-4000-8000-000000000001';
export const VEHICLE_UUID = 'c1c2c3c4-0001-4000-8000-000000000001';
export const SERVICE_UUID_1 = 'd1d2d3d4-0001-4000-8000-000000000001';
export const SERVICE_UUID_2 = 'd1d2d3d4-0002-4000-8000-000000000002';
export const ITEM_UUID_1 = 'e1e2e3e4-0001-4000-8000-000000000001';
export const ITEM_UUID_2 = 'e1e2e3e4-0002-4000-8000-000000000002';

export const makeServiceOrderId = (value = SO_UUID_1): ServiceOrderId =>
  ServiceOrderId.fromString(value);

export const makeSOService = (
  overrides: Partial<{
    serviceId: string;
    name: string;
    unitPriceCents: number;
    quantity: number;
  }> = {},
) =>
  ServiceOrderService.create({
    serviceId: SERVICE_UUID_1,
    name: 'Troca de óleo',
    unitPriceCents: 8000,
    quantity: 1,
    ...overrides,
  });

export const makeSOItem = (
  overrides: Partial<{
    itemId: string;
    name: string;
    unitPriceCents: number;
    quantity: number;
  }> = {},
) =>
  ServiceOrderItem.create({
    itemId: ITEM_UUID_1,
    name: 'Filtro de óleo',
    unitPriceCents: 3500,
    quantity: 1,
    ...overrides,
  });

export const makeRestoreProps = (
  overrides: Partial<ServiceOrderProps> = {},
): ServiceOrderProps => ({
  id: makeServiceOrderId(),
  customerId: CUSTOMER_UUID,
  vehicleId: VEHICLE_UUID,
  status: 'RECEIVED',
  services: [],
  items: [],
  budgetSentAt: null,
  approvedAt: null,
  rejectedAt: null,
  finalizedAt: null,
  deliveredAt: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

export const makeServiceOrder = (
  overrides: Partial<ServiceOrderProps> = {},
): ServiceOrder => ServiceOrder.restore(makeRestoreProps(overrides));

// Helper para criar OS em status específico com dados necessários
export const makeServiceOrderWithStatus = (
  status: ServiceOrderStatus,
  overrides: Partial<ServiceOrderProps> = {},
): ServiceOrder => {
  const now = new Date();
  const base: Partial<ServiceOrderProps> = { status };

  if (
    ['AWAITING_APPROVAL', 'IN_EXECUTION', 'FINALIZED', 'DELIVERED'].includes(
      status,
    )
  ) {
    base.services = [makeSOService()];
    base.budgetSentAt = now;
  }
  if (['IN_EXECUTION', 'FINALIZED', 'DELIVERED'].includes(status)) {
    base.approvedAt = now;
  }
  if (['FINALIZED', 'DELIVERED'].includes(status)) {
    base.finalizedAt = now;
  }
  if (status === 'DELIVERED') {
    base.deliveredAt = now;
  }

  return ServiceOrder.restore(makeRestoreProps({ ...base, ...overrides }));
};
