import { ServiceOrder } from '../../domain/service-order.entity';
import { ServiceOrderId } from '../../domain/value-objects/service-order-id.vo';
import { ServiceOrderItem } from '../../domain/value-objects/service-order-item.vo';
import { ServiceOrderService } from '../../domain/value-objects/service-order-service.vo';

import { ServiceOrderOrmEntity } from './service-order.typeorm.entity';

export class ServiceOrderMapper {
  static toDomain(orm: ServiceOrderOrmEntity): ServiceOrder {
    const services = (JSON.parse(orm.services) as any[]).map(
      ServiceOrderService.restore,
    );
    const items = (JSON.parse(orm.items) as any[]).map(
      ServiceOrderItem.restore,
    );

    return ServiceOrder.restore({
      id: ServiceOrderId.fromString(orm.id),
      customerId: orm.customerId,
      vehicleId: orm.vehicleId,
      status: orm.status,
      services,
      items,
      budgetSentAt: orm.budgetSentAt,
      approvedAt: orm.approvedAt,
      rejectedAt: orm.rejectedAt,
      finalizedAt: orm.finalizedAt,
      deliveredAt: orm.deliveredAt,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(order: ServiceOrder): ServiceOrderOrmEntity {
    const orm = new ServiceOrderOrmEntity();
    orm.id = order.id().value;
    orm.customerId = order.customerId;
    orm.vehicleId = order.vehicleId;
    orm.status = order.status;
    orm.services = JSON.stringify(
      order.services.map((s) => ({
        serviceId: s.serviceId,
        name: s.name,
        unitPriceCents: s.unitPriceCents,
        quantity: s.quantity,
      })),
    );
    orm.items = JSON.stringify(
      order.items.map((i) => ({
        itemId: i.itemId,
        name: i.name,
        unitPriceCents: i.unitPriceCents,
        quantity: i.quantity,
      })),
    );
    orm.budgetSentAt = order.budgetSentAt;
    orm.approvedAt = order.approvedAt;
    orm.rejectedAt = order.rejectedAt;
    orm.finalizedAt = order.finalizedAt;
    orm.deliveredAt = order.deliveredAt;
    orm.createdAt = order.createdAt;
    orm.updatedAt = order.updatedAt;
    return orm;
  }
}
