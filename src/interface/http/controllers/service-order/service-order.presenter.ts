import { ServiceOrder } from '@domain/service-order/service-order.entity';

export class ServiceOrderPresenter {
  public static toResponse(order: ServiceOrder) {
    return {
      id: order.id,
      status: order.status,
      totalCost: (order.totalCost / 100).toFixed(2),
      customerId: order.customerId,
      vehicleId: order.vehicleId,
      parts: order.parts.map((p) => ({
        partId: p.partId,
        quantity: p.quantity,
        priceAtTime: p.priceAtTime.toFixed(2),
      })),
      repairs: order.repairs.map((r) => ({
        repairId: r.repairId,
        costAtTime: r.costAtTime.toFixed(2),
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      finishedAt: order.finishedAt,
    };
  }
}
