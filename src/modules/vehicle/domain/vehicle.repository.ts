import type { LicensePlate } from './value-objects/license-plate.vo';
import type { VehicleId } from './value-objects/vehicle-id.vo';
import type { Vehicle } from './vehicle.entity';

export interface ListVehiclesFilters {
  customerId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IVehicleRepository {
  save(vehicle: Vehicle): Promise<void>;
  update(vehicle: Vehicle): Promise<void>;
  delete(id: VehicleId): Promise<void>;
  findById(id: VehicleId): Promise<Vehicle | null>;
  findByLicensePlate(plate: LicensePlate): Promise<Vehicle | null>;
  existsByLicensePlate(plate: LicensePlate): Promise<boolean>;
  list(filters: ListVehiclesFilters): Promise<PaginatedResult<Vehicle>>;
}

export const VEHICLE_REPOSITORY = Symbol('IVehicleRepository');
