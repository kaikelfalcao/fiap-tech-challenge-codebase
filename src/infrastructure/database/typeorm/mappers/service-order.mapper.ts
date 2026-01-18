import { ServiceOrder } from 'src/domain/entities/service-order.entity';
import { ServiceOrderOrm } from '../entities/service-order.orm';
import { PartsOnServiceOrdersOrm } from '../entities/parts-on-service-orders.orm';
import { RepairsOnServiceOrdersOrm } from '../entities/repairs-on-service-orders.orm';
import { PartsOnServiceOrder } from 'src/domain/entities/parts-on-service-order.entity';
import { RepairsOnServiceOrder } from 'src/domain/entities/repairs-on-service-order.entity';

export class ServiceOrderMapper {
  static toOrm(entity: ServiceOrder): ServiceOrderOrm {
    const orm = new ServiceOrderOrm();
    orm.id = entity.id;
    orm.status = entity.status;
    orm.totalCost = entity.totalCost;
    orm.customerId = entity.customerId;
    orm.vehicleId = entity.vehicleId;
    orm.finishedAt = entity.finishedAt;
    orm.parts = entity.parts.map((p) => {
      const partOrm = new PartsOnServiceOrdersOrm();
      partOrm.serviceOrderId = p.serviceOrderId;
      partOrm.partId = p.partId;
      partOrm.quantity = p.quantity;
      partOrm.priceAtTime = p.priceAtTime;
      partOrm.assignedAt = p.assignedAt;
      return partOrm;
    });
    orm.repairs = entity.repairs.map((r) => {
      const repairOrm = new RepairsOnServiceOrdersOrm();
      repairOrm.serviceOrderId = r.serviceOrderId;
      repairOrm.repairId = r.repairId;
      repairOrm.costAtTime = r.costAtTime;
      repairOrm.assignedAt = r.assignedAt;
      return repairOrm;
    });
    return orm;
  }

  static toEntity(orm: ServiceOrderOrm): ServiceOrder {
    const entity = new ServiceOrder(
      orm.id,
      orm.status,
      orm.totalCost,
      orm.customerId,
      orm.vehicleId,
      orm.parts.map(
        (p) =>
          new PartsOnServiceOrder(
            p.serviceOrderId,
            p.partId,
            p.quantity,
            p.priceAtTime,
            p.assignedAt,
          ),
      ),
      orm.repairs.map(
        (r) =>
          new RepairsOnServiceOrder(
            r.serviceOrderId,
            r.repairId,
            r.costAtTime,
            r.assignedAt,
          ),
      ),
      orm.createdAt,
      orm.updatedAt,
      orm.finishedAt,
    );
    return entity;
  }
}
