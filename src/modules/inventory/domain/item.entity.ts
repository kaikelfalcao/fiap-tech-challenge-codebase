import type { ItemCode } from './value-objects/item-code.vo';
import type { ItemId } from './value-objects/item-id.vo';
import type { ItemType } from './value-objects/item-type.vo';

import { Entity } from '@/shared/domain/entity';
import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import type { Identity } from '@/shared/domain/value-objects/identity.vo';
import type { Money } from '@/shared/domain/value-objects/money.vo';

export interface ItemProps {
  id: ItemId;
  code: ItemCode;
  name: string;
  type: ItemType;
  unit: string;
  unitPrice: Money;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateItemProps {
  id: ItemId;
  code: ItemCode;
  name: string;
  type: ItemType;
  unit: string;
  unitPrice: Money;
}

export interface ChangeItemProps {
  name?: string;
  unit?: string;
  unitPrice?: Money;
}

export class Item extends Entity {
  private readonly _id: ItemId;
  private _code: ItemCode;
  private _name: string;
  private readonly _type: ItemType;
  private _unit: string;
  private _unitPrice: Money;
  private _active: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ItemProps) {
    super();
    this._id = props.id;
    this._code = props.code;
    this._name = props.name;
    this._type = props.type;
    this._unit = props.unit;
    this._unitPrice = props.unitPrice;
    this._active = props.active;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateItemProps): Item {
    const now = new Date();
    return new Item({ ...props, active: true, createdAt: now, updatedAt: now });
  }

  static restore(props: ItemProps): Item {
    return new Item(props);
  }

  // --- Behaviour ---

  changeAttributes(props: ChangeItemProps): void {
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.unit !== undefined) {
      this._unit = props.unit;
    }
    if (props.unitPrice !== undefined) {
      this._unitPrice = props.unitPrice;
    }
    this._updatedAt = new Date();
  }

  activate(): void {
    if (this._active) {
      return;
    }
    this._active = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    if (!this._active) {
      return;
    }
    this._active = false;
    this._updatedAt = new Date();
  }

  ensureCanBeDeleted(): void {
    if (this._active) {
      throw new BusinessRuleException(
        'Cannot delete an active item. Deactivate it first.',
      );
    }
  }

  // --- Identity ---
  id(): Identity {
    return this._id;
  }

  // --- Getters ---
  get code(): ItemCode {
    return this._code;
  }
  get name(): string {
    return this._name;
  }
  get type(): ItemType {
    return this._type;
  }
  get unit(): string {
    return this._unit;
  }
  get unitPrice(): Money {
    return this._unitPrice;
  }
  get active(): boolean {
    return this._active;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
