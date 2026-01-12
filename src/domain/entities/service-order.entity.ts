import { randomUUID } from 'crypto';
import { ServiceOrderStatus } from '../enums/service-order-status.enum';
import { PartsOnServiceOrder } from './parts-on-service-order.entity';
import { RepairsOnServiceOrder } from './repairs-on-service-order.entity';

export class ServiceOrder {
  constructor(
    public id: string,
    public status: ServiceOrderStatus,
    public totalCost: number,
    public customerId: string,
    public vehicleId: string,
    public parts: PartsOnServiceOrder[] = [],
    public repairs: RepairsOnServiceOrder[] = [],
    public createdAt?: Date,
    public updatedAt?: Date,
    public finishedAt?: Date,
  ) {}

  static create(
    customerId: string,
    vehicleId: string,
    id?: string,
  ): ServiceOrder {
    return new ServiceOrder(
      id ?? randomUUID(),
      ServiceOrderStatus.Received,
      0,
      customerId,
      vehicleId,
    );
  }

  assignPart(partId: string, quantity: number, priceAtTime: number) {
    const existing = this.parts.find((p) => p.partId === partId);
    if (existing) {
      existing.quantity += quantity;
      existing.priceAtTime = priceAtTime;
      existing.assignedAt = new Date();
    } else {
      this.parts.push(
        new PartsOnServiceOrder(this.id, partId, quantity, priceAtTime),
      );
    }
    this.recalculateTotalCost();
  }

  assignRepair(repairId: string, costAtTime: number) {
    const existing = this.repairs.find((r) => r.repairId === repairId);
    if (!existing) {
      this.repairs.push(
        new RepairsOnServiceOrder(this.id, repairId, costAtTime),
      );
    }
    this.recalculateTotalCost();
  }

  changeStatus(newStatus: ServiceOrderStatus) {
    const validTransitions: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
      RECEIVED: [ServiceOrderStatus.InDiagnosis, ServiceOrderStatus.Canceled],
      IN_DIAGNOSIS: [
        ServiceOrderStatus.AwaitingApproval,
        ServiceOrderStatus.Canceled,
      ],
      AWAITING_APPROVAL: [
        ServiceOrderStatus.InProgress,
        ServiceOrderStatus.Canceled,
      ],
      IN_PROGRESS: [
        ServiceOrderStatus.Delivered,
        ServiceOrderStatus.Canceled,
        ServiceOrderStatus.Finished,
      ],
      DELIVERED: [ServiceOrderStatus.Finished],
      FINISHED: [],
      CANCELED: [],
    };

    if (!validTransitions[this.status].includes(newStatus)) {
      throw new Error(`Transição inválida de ${this.status} para ${newStatus}`);
    }

    this.status = newStatus;
    if (newStatus === ServiceOrderStatus.Finished) {
      this.finishedAt = new Date();
    }
  }

  private recalculateTotalCost() {
    const partsCost = this.parts.reduce(
      (sum, p) => sum + p.quantity * (p.priceAtTime * 100),
      0,
    );
    const repairsCost = this.repairs.reduce(
      (sum, r) => sum + r.costAtTime * 100,
      0,
    );
    this.totalCost = partsCost + repairsCost;
  }
}
