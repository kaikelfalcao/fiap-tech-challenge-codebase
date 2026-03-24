// src/modules/service-order/domain/service-order.entity.ts
import type { ServiceOrderId } from './value-objects/service-order-id.vo';
import type { ServiceOrderItem } from './value-objects/service-order-item.vo';
import type { ServiceOrderService } from './value-objects/service-order-service.vo';
import type { ServiceOrderStatus } from './value-objects/service-order-status.vo';

import { Entity } from '@/shared/domain/entity';
import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import type { Identity } from '@/shared/domain/value-objects/identity.vo';

export interface ServiceOrderProps {
  id: ServiceOrderId;
  customerId: string;
  vehicleId: string;
  status: ServiceOrderStatus;
  services: ServiceOrderService[];
  items: ServiceOrderItem[];
  budgetSentAt: Date | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  finalizedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceOrderProps {
  id: ServiceOrderId;
  customerId: string;
  vehicleId: string;
}

export class ServiceOrder extends Entity {
  private readonly _id: ServiceOrderId;
  private readonly _customerId: string;
  private readonly _vehicleId: string;
  private _status: ServiceOrderStatus;
  private _services: ServiceOrderService[];
  private _items: ServiceOrderItem[];
  private _budgetSentAt: Date | null;
  private _approvedAt: Date | null;
  private _rejectedAt: Date | null;
  private _finalizedAt: Date | null;
  private _deliveredAt: Date | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ServiceOrderProps) {
    super();
    this._id = props.id;
    this._customerId = props.customerId;
    this._vehicleId = props.vehicleId;
    this._status = props.status;
    this._services = [...props.services];
    this._items = [...props.items];
    this._budgetSentAt = props.budgetSentAt;
    this._approvedAt = props.approvedAt;
    this._rejectedAt = props.rejectedAt;
    this._finalizedAt = props.finalizedAt;
    this._deliveredAt = props.deliveredAt;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  // --- Factory ---

  static create(props: CreateServiceOrderProps): ServiceOrder {
    const now = new Date();
    return new ServiceOrder({
      ...props,
      status: 'RECEIVED',
      services: [],
      items: [],
      budgetSentAt: null,
      approvedAt: null,
      rejectedAt: null,
      finalizedAt: null,
      deliveredAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: ServiceOrderProps): ServiceOrder {
    return new ServiceOrder(props);
  }

  // --- Services ---

  addService(service: ServiceOrderService): void {
    this.ensureEditable();
    const existing = this._services.findIndex(
      (s) => s.serviceId === service.serviceId,
    );
    if (existing >= 0) {
      throw new BusinessRuleException(
        `Service ${service.serviceId} is already in this order`,
      );
    }
    this._services.push(service);
    this._updatedAt = new Date();
  }

  removeService(serviceId: string): void {
    this.ensureEditable();
    const index = this._services.findIndex((s) => s.serviceId === serviceId);
    if (index < 0) {
      throw new BusinessRuleException(
        `Service ${serviceId} not found in this order`,
      );
    }
    this._services.splice(index, 1);
    this._updatedAt = new Date();
  }

  // --- Items ---

  addItem(item: ServiceOrderItem): void {
    this.ensureEditable();
    const existing = this._items.findIndex((i) => i.itemId === item.itemId);
    if (existing >= 0) {
      throw new BusinessRuleException(
        `Item ${item.itemId} is already in this order`,
      );
    }
    this._items.push(item);
    this._updatedAt = new Date();
  }

  removeItem(itemId: string): void {
    this.ensureEditable();
    const index = this._items.findIndex((i) => i.itemId === itemId);
    if (index < 0) {
      throw new BusinessRuleException(`Item ${itemId} not found in this order`);
    }
    this._items.splice(index, 1);
    this._updatedAt = new Date();
  }

  // --- Status transitions ---

  startDiagnosis(): void {
    this.ensureStatus('RECEIVED', 'start diagnosis');
    this._status = 'DIAGNOSIS';
    this._updatedAt = new Date();
  }

  sendBudget(): void {
    this.ensureStatus('DIAGNOSIS', 'send budget');
    if (this._services.length === 0) {
      throw new BusinessRuleException(
        'Cannot send budget with no services in the order',
      );
    }
    this._status = 'AWAITING_APPROVAL';
    this._budgetSentAt = new Date();
    this._updatedAt = new Date();
  }

  approve(): void {
    this.ensureStatus('AWAITING_APPROVAL', 'approve');
    this._status = 'IN_EXECUTION';
    this._approvedAt = new Date();
    this._updatedAt = new Date();
  }

  reject(): void {
    this.ensureStatus('AWAITING_APPROVAL', 'reject');
    this._status = 'FINALIZED';
    this._rejectedAt = new Date();
    this._finalizedAt = new Date();
    this._updatedAt = new Date();
  }

  finalize(): void {
    this.ensureStatus('IN_EXECUTION', 'finalize');
    this._status = 'FINALIZED';
    this._finalizedAt = new Date();
    this._updatedAt = new Date();
  }

  deliver(): void {
    this.ensureStatus('FINALIZED', 'deliver');
    this._status = 'DELIVERED';
    this._deliveredAt = new Date();
    this._updatedAt = new Date();
  }

  // --- Budget ---

  get totalServicesCents(): number {
    return this._services.reduce((acc, s) => acc + s.totalCents, 0);
  }

  get totalItemsCents(): number {
    return this._items.reduce((acc, i) => acc + i.totalCents, 0);
  }

  get totalCents(): number {
    return this.totalServicesCents + this.totalItemsCents;
  }

  // --- Guards ---

  private ensureEditable(): void {
    const editableStatuses: ServiceOrderStatus[] = ['RECEIVED', 'DIAGNOSIS'];
    if (!editableStatuses.includes(this._status)) {
      throw new BusinessRuleException(
        `Cannot modify order in status ${this._status}`,
      );
    }
  }

  private ensureStatus(expected: ServiceOrderStatus, action: string): void {
    if (this._status !== expected) {
      throw new BusinessRuleException(
        `Cannot ${action}: order is in status ${this._status}, expected ${expected}`,
      );
    }
  }

  // --- Identity ---
  id(): Identity {
    return this._id;
  }

  // --- Getters ---
  get customerId(): string {
    return this._customerId;
  }
  get vehicleId(): string {
    return this._vehicleId;
  }
  get status(): ServiceOrderStatus {
    return this._status;
  }
  get services(): ServiceOrderService[] {
    return [...this._services];
  }
  get items(): ServiceOrderItem[] {
    return [...this._items];
  }
  get budgetSentAt(): Date | null {
    return this._budgetSentAt;
  }
  get approvedAt(): Date | null {
    return this._approvedAt;
  }
  get rejectedAt(): Date | null {
    return this._rejectedAt;
  }
  get finalizedAt(): Date | null {
    return this._finalizedAt;
  }
  get deliveredAt(): Date | null {
    return this._deliveredAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
