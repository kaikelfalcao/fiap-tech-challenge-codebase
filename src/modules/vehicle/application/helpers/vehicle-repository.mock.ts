import { mock } from 'jest-mock-extended';

import type { IVehicleRepository } from '../../domain/vehicle.repository';

export const makeVehicleRepositoryMock = () => mock<IVehicleRepository>();
export type VehicleRepositoryMock = ReturnType<
  typeof makeVehicleRepositoryMock
>;
