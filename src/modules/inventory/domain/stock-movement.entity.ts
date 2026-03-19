import type { StockMovementId } from './value-objects/stock-movement-id.vo';

import { Entity } from '@/shared/domain/entity';
import type { Identity } from '@/shared/domain/value-objects/identity.vo';

export type MovementReason =
  | 'PURCHASE' // entrada por compra
  | 'ADJUSTMENT' // ajuste manual
  | 'RESERVATION' // reserva por OS
  | 'RELEASE' // liberação de reserva
  | 'CONSUMPTION'; // consumo confirmado por OS

export interface StockMovementProps {
  id: StockMovementId;
  stockId: string;
  quantity: number;
  reason: MovementReason;
  referenceId?: string;
  note?: string;
  createdAt: Date;
}

export class StockMovement extends Entity {
  private readonly _id: StockMovementId;
  private readonly _stockId: string;
  private readonly _quantity: number;
  private readonly _reason: MovementReason;
  private readonly _referenceId?: string;
  private readonly _note?: string;
  private readonly _createdAt: Date;

  private constructor(props: StockMovementProps) {
    super();
    this._id = props.id;
    this._stockId = props.stockId;
    this._quantity = props.quantity;
    this._reason = props.reason;
    this._referenceId = props.referenceId;
    this._note = props.note;
    this._createdAt = props.createdAt;
  }

  static create(props: Omit<StockMovementProps, 'createdAt'>): StockMovement {
    return new StockMovement({ ...props, createdAt: new Date() });
  }

  static restore(props: StockMovementProps): StockMovement {
    return new StockMovement(props);
  }

  id(): Identity {
    return this._id;
  }

  get stockId(): string {
    return this._stockId;
  }
  get quantity(): number {
    return this._quantity;
  }
  get reason(): MovementReason {
    return this._reason;
  }
  get referenceId(): string | undefined {
    return this._referenceId;
  }
  get note(): string | undefined {
    return this._note;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
}
