import { StockMovement, type MovementReason } from './stock-movement.entity';
import type { StockId } from './value-objects/stock-id.vo';
import type { StockMovementId } from './value-objects/stock-movement-id.vo';

import { Entity } from '@/shared/domain/entity';
import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import type { Identity } from '@/shared/domain/value-objects/identity.vo';

export interface StockProps {
  id: StockId;
  itemId: string;
  quantity: number;
  reserved: number;
  minimum: number;
  updatedAt: Date;
}

export class Stock extends Entity {
  private readonly _id: StockId;
  private readonly _itemId: string;
  private _quantity: number;
  private _reserved: number;
  private readonly _minimum: number;
  private _updatedAt: Date;

  private constructor(props: StockProps) {
    super();
    this._id = props.id;
    this._itemId = props.itemId;
    this._quantity = props.quantity;
    this._reserved = props.reserved;
    this._minimum = props.minimum;
    this._updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<StockProps, 'quantity' | 'reserved' | 'updatedAt'>,
  ): Stock {
    return new Stock({
      ...props,
      quantity: 0,
      reserved: 0,
      updatedAt: new Date(),
    });
  }

  static restore(props: StockProps): Stock {
    return new Stock(props);
  }

  // --- Behaviour ---

  addQuantity(
    amount: number,
    movementId: StockMovementId,
    reason: MovementReason,
    referenceId?: string,
    note?: string,
  ): StockMovement {
    if (amount <= 0) {
      throw new BusinessRuleException('Amount must be positive');
    }
    this._quantity += amount;
    this._updatedAt = new Date();
    return StockMovement.create({
      id: movementId,
      stockId: this._id.value,
      quantity: +amount,
      reason,
      referenceId,
      note,
    });
  }

  reserve(
    amount: number,
    movementId: StockMovementId,
    referenceId: string,
    note?: string,
  ): StockMovement {
    if (amount <= 0) {
      throw new BusinessRuleException('Amount must be positive');
    }
    if (this.available < amount) {
      throw new BusinessRuleException(
        `Insufficient stock. Available: ${this.available}, requested: ${amount}`,
      );
    }
    this._reserved += amount;
    this._updatedAt = new Date();
    return StockMovement.create({
      id: movementId,
      stockId: this._id.value,
      quantity: -amount,
      reason: 'RESERVATION',
      referenceId,
      note,
    });
  }

  release(
    amount: number,
    movementId: StockMovementId,
    referenceId: string,
    note?: string,
  ): StockMovement {
    if (amount <= 0) {
      throw new BusinessRuleException('Amount must be positive');
    }
    if (this._reserved < amount) {
      throw new BusinessRuleException(
        `Cannot release more than reserved. Reserved: ${this._reserved}, requested: ${amount}`,
      );
    }
    this._reserved -= amount;
    this._updatedAt = new Date();
    return StockMovement.create({
      id: movementId,
      stockId: this._id.value,
      quantity: +amount,
      reason: 'RELEASE',
      referenceId,
      note,
    });
  }

  consume(
    amount: number,
    movementId: StockMovementId,
    referenceId: string,
    note?: string,
  ): StockMovement {
    if (amount <= 0) {
      throw new BusinessRuleException('Amount must be positive');
    }
    if (this._reserved < amount) {
      throw new BusinessRuleException(
        `Cannot consume more than reserved. Reserved: ${this._reserved}, requested: ${amount}`,
      );
    }
    this._quantity -= amount;
    this._reserved -= amount;
    this._updatedAt = new Date();
    return StockMovement.create({
      id: movementId,
      stockId: this._id.value,
      quantity: -amount,
      reason: 'CONSUMPTION',
      referenceId,
      note,
    });
  }

  adjust(
    newQuantity: number,
    movementId: StockMovementId,
    note: string,
  ): StockMovement {
    if (newQuantity < 0) {
      throw new BusinessRuleException('Quantity cannot be negative');
    }
    if (newQuantity < this._reserved) {
      throw new BusinessRuleException(
        `Cannot adjust below reserved quantity. Reserved: ${this._reserved}`,
      );
    }
    const diff = newQuantity - this._quantity;
    this._quantity = newQuantity;
    this._updatedAt = new Date();
    return StockMovement.create({
      id: movementId,
      stockId: this._id.value,
      quantity: diff,
      reason: 'ADJUSTMENT',
      note,
    });
  }

  // --- Computed ---
  get available(): number {
    return this._quantity - this._reserved;
  }
  get isBelowMinimum(): boolean {
    return this.available <= this._minimum;
  }

  // --- Identity ---
  id(): Identity {
    return this._id;
  }

  // --- Getters ---
  get itemId(): string {
    return this._itemId;
  }
  get quantity(): number {
    return this._quantity;
  }
  get reserved(): number {
    return this._reserved;
  }
  get minimum(): number {
    return this._minimum;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
