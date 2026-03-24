import type { CustomerId } from './customer-id.vo';
import type { TaxId } from './tax-id.vo';

import { Entity } from '@/shared/domain/entity';
import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import type { Email } from '@/shared/domain/value-objects/email.vo';
import type { Identity } from '@/shared/domain/value-objects/identity.vo';

export interface CustomerProps {
  id: CustomerId;
  taxId: TaxId;
  fullName: string;
  phone: string;
  email: Email;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerProps {
  id: CustomerId;
  taxId: TaxId;
  fullName: string;
  phone: string;
  email: Email;
}

export interface ChangeCustomerProps {
  fullName?: string;
  phone?: string;
  email?: Email;
}

export class Customer extends Entity {
  private readonly _id: CustomerId;
  private readonly _taxId: TaxId;
  private _fullName: string;
  private _phone: string;
  private _email: Email;
  private _active: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: CustomerProps) {
    super();
    this._id = props.id;
    this._taxId = props.taxId;
    this._fullName = props.fullName;
    this._phone = props.phone;
    this._email = props.email;
    this._active = props.active;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  // --- Factory ---

  public static create(props: CreateCustomerProps): Customer {
    const now = new Date();
    return new Customer({
      ...props,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static restore(props: CustomerProps): Customer {
    return new Customer(props);
  }

  // --- Comportamento ---

  public changeAttributes(props: ChangeCustomerProps): void {
    if (props.fullName !== undefined) {
      this._fullName = props.fullName;
    }
    if (props.phone !== undefined) {
      this._phone = props.phone;
    }
    if (props.email !== undefined) {
      this._email = props.email;
    }
    this._updatedAt = new Date();
  }

  public activate(): void {
    if (this._active) {
      return;
    }
    this._active = true;
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    if (!this._active) {
      return;
    }
    this._active = false;
    this._updatedAt = new Date();
  }

  public ensureCanBeDeleted(): void {
    if (this._active) {
      throw new BusinessRuleException(
        'Cannot delete an active customer. Deactivate it first.',
      );
    }
  }

  // --- Getters ---

  public id(): Identity {
    return this._id;
  }

  public get taxId(): TaxId {
    return this._taxId;
  }

  public get fullName(): string {
    return this._fullName;
  }

  public get phone(): string {
    return this._phone;
  }

  public get email(): Email {
    return this._email;
  }

  public get active(): boolean {
    return this._active;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
