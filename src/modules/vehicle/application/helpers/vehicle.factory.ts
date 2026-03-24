import { LicensePlate } from '../../domain/value-objects/license-plate.vo';
import { VehicleId } from '../../domain/value-objects/vehicle-id.vo';
import { Vehicle } from '../../domain/vehicle.entity';
import type {
  CreateVehicleProps,
  VehicleProps,
} from '../../domain/vehicle.entity';

export const VALID_PLATE_OLD = 'ABC1234';
export const VALID_PLATE_MERCOSUL = 'ABC1D23';
export const VALID_CUSTOMER_ID = 'a1b2c3d4-0001-4000-8000-000000000001';

export const VEHICLE_UUID_1 = 'b1c2d3e4-0001-4000-8000-000000000001';
export const VEHICLE_UUID_2 = 'b1c2d3e4-0002-4000-8000-000000000002';
export const VEHICLE_UUID_3 = 'b1c2d3e4-0003-4000-8000-000000000003';

export const makeVehicleId = (value = VEHICLE_UUID_1): VehicleId =>
  VehicleId.fromString(value);

export const makeLicensePlate = (value = VALID_PLATE_OLD): LicensePlate =>
  LicensePlate.create(value);

export const makeCreateProps = (
  overrides: Partial<CreateVehicleProps> = {},
): CreateVehicleProps => ({
  id: makeVehicleId(),
  customerId: VALID_CUSTOMER_ID,
  licensePlate: makeLicensePlate(),
  brand: 'Toyota',
  model: 'Corolla',
  year: 2022,
  ...overrides,
});

export const makeRestoreProps = (
  overrides: Partial<VehicleProps> = {},
): VehicleProps => ({
  id: makeVehicleId(),
  customerId: VALID_CUSTOMER_ID,
  licensePlate: makeLicensePlate(),
  brand: 'Toyota',
  model: 'Corolla',
  year: 2022,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

export const makeVehicle = (overrides: Partial<VehicleProps> = {}): Vehicle =>
  Vehicle.restore(makeRestoreProps(overrides));
