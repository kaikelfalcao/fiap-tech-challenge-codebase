import type { Role } from './value-objects/role.vo';
import type { UserId } from './value-objects/user-id.vo';

import { Entity } from '@/shared/domain/entity';
import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import type { Identity } from '@/shared/domain/value-objects/identity.vo';

export interface UserProps {
  id: UserId;
  taxId: string; // CPF/CNPJ raw (sem formatação)
  name: string;
  passwordHash: string;
  role: Role;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProps {
  id: UserId;
  taxId: string;
  name: string;
  passwordHash: string;
  role: Role;
}

export class User extends Entity {
  private readonly _id: UserId;
  private readonly _taxId: string;
  private _name: string;
  private _passwordHash: string;
  private _role: Role;
  private _active: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: UserProps) {
    super();
    this._id = props.id;
    this._taxId = props.taxId;
    this._name = props.name;
    this._passwordHash = props.passwordHash;
    this._role = props.role;
    this._active = props.active;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateUserProps): User {
    const now = new Date();
    return new User({ ...props, active: true, createdAt: now, updatedAt: now });
  }

  static restore(props: UserProps): User {
    return new User(props);
  }

  // --- Behaviour ---

  deactivate(): void {
    if (!this._active) {
      return;
    }
    this._active = false;
    this._updatedAt = new Date();
  }

  activate(): void {
    if (this._active) {
      return;
    }
    this._active = true;
    this._updatedAt = new Date();
  }

  changePassword(newHash: string): void {
    this._passwordHash = newHash;
    this._updatedAt = new Date();
  }

  ensureIsActive(): void {
    if (!this._active) {
      throw new BusinessRuleException('User account is inactive');
    }
  }

  // --- Identity ---
  id(): Identity {
    return this._id;
  }

  // --- Getters ---
  get taxId(): string {
    return this._taxId;
  }
  get name(): string {
    return this._name;
  }
  get passwordHash(): string {
    return this._passwordHash;
  }
  get role(): Role {
    return this._role;
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
