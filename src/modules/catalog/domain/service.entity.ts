import type { Duration } from './value-objects/duration.vo';
import type { ServiceCode } from './value-objects/service-code.vo';
import type { ServiceId } from './value-objects/service-id.vo';

import { Entity } from '@/shared/domain/entity';
import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import type { Identity } from '@/shared/domain/value-objects/identity.vo';
import type { Money } from '@/shared/domain/value-objects/money.vo';

export interface ServiceProps {
  id: ServiceId;
  code: ServiceCode;
  name: string;
  description: string;
  basePrice: Money;
  estimatedDuration: Duration;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceProps {
  id: ServiceId;
  code: ServiceCode;
  name: string;
  description: string;
  basePrice: Money;
  estimatedDuration: Duration;
}

export interface ChangeServiceProps {
  name?: string;
  description?: string;
  basePrice?: Money;
  estimatedDuration?: Duration;
}

export class Service extends Entity {
  private readonly _id: ServiceId;
  private _code: ServiceCode;
  private _name: string;
  private _description: string;
  private _basePrice: Money;
  private _estimatedDuration: Duration;
  private _active: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ServiceProps) {
    super();
    this._id = props.id;
    this._code = props.code;
    this._name = props.name;
    this._description = props.description;
    this._basePrice = props.basePrice;
    this._estimatedDuration = props.estimatedDuration;
    this._active = props.active;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  // --- Factory ---

  static create(props: CreateServiceProps): Service {
    const now = new Date();
    return new Service({
      ...props,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: ServiceProps): Service {
    return new Service(props);
  }

  // --- Behaviour ---

  changeAttributes(props: ChangeServiceProps): void {
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.description !== undefined) {
      this._description = props.description;
    }
    if (props.basePrice !== undefined) {
      this._basePrice = props.basePrice;
    }
    if (props.estimatedDuration !== undefined) {
      this._estimatedDuration = props.estimatedDuration;
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
        'Cannot delete an active service. Deactivate it first.',
      );
    }
  }

  // --- Identity ---
  id(): Identity {
    return this._id;
  }

  // --- Getters ---
  get code(): ServiceCode {
    return this._code;
  }
  get name(): string {
    return this._name;
  }
  get description(): string {
    return this._description;
  }
  get basePrice(): Money {
    return this._basePrice;
  }
  get estimatedDuration(): Duration {
    return this._estimatedDuration;
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
