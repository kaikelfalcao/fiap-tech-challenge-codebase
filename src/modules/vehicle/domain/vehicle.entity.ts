import type { LicensePlate } from './value-objects/license-plate.vo';
import type { VehicleId } from './value-objects/vehicle-id.vo';

import { Entity } from '@/shared/domain/entity';
import type { Identity } from '@/shared/domain/value-objects/identity.vo';

export interface VehicleProps {
  id: VehicleId;
  customerId: string;
  licensePlate: LicensePlate;
  brand: string;
  model: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVehicleProps {
  id: VehicleId;
  customerId: string;
  licensePlate: LicensePlate;
  brand: string;
  model: string;
  year: number;
}

export interface ChangeVehicleProps {
  licensePlate?: LicensePlate;
  brand?: string;
  model?: string;
  year?: number;
}

export class Vehicle extends Entity {
  private readonly _id: VehicleId;
  private readonly _customerId: string;
  private _licensePlate: LicensePlate;
  private _brand: string;
  private _model: string;
  private _year: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: VehicleProps) {
    super();
    this._id = props.id;
    this._customerId = props.customerId;
    this._licensePlate = props.licensePlate;
    this._brand = props.brand;
    this._model = props.model;
    this._year = props.year;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  // --- Factory ---

  static create(props: CreateVehicleProps): Vehicle {
    const now = new Date();
    return new Vehicle({ ...props, createdAt: now, updatedAt: now });
  }

  static restore(props: VehicleProps): Vehicle {
    return new Vehicle(props);
  }

  // --- Behaviour ---

  changeAttributes(props: ChangeVehicleProps): void {
    if (props.licensePlate !== undefined) {
      this._licensePlate = props.licensePlate;
    }
    if (props.brand !== undefined) {
      this._brand = props.brand;
    }
    if (props.model !== undefined) {
      this._model = props.model;
    }
    if (props.year !== undefined) {
      this._year = props.year;
    }
    this._updatedAt = new Date();
  }

  ensureCanBeDeleted(): void {
    // Regra atual: qualquer veículo pode ser deletado (hard delete)
    // Expandir aqui quando houver restrições (ex: veículo em ServiceOrder aberta)
  }

  // --- Identity ---

  id(): Identity {
    return this._id;
  }

  // --- Getters ---

  get customerId(): string {
    return this._customerId;
  }

  get licensePlate(): LicensePlate {
    return this._licensePlate;
  }

  get brand(): string {
    return this._brand;
  }

  get model(): string {
    return this._model;
  }

  get year(): number {
    return this._year;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
