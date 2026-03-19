import { LicensePlate } from '../../../domain/value-objects/license-plate.vo';
import {
  makeVehicleRepositoryMock,
  type VehicleRepositoryMock,
} from '../../helpers/vehicle-repository.mock';
import {
  makeVehicle,
  VEHICLE_UUID_1,
  VALID_PLATE_MERCOSUL,
} from '../../helpers/vehicle.factory';

import { GetVehicleUseCase } from './get-vehicle.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('GetVehicleUseCase', () => {
  let sut: GetVehicleUseCase;
  let repo: VehicleRepositoryMock;

  beforeEach(() => {
    repo = makeVehicleRepositoryMock();
    sut = new GetVehicleUseCase(repo);
  });

  it('should return the vehicle output', async () => {
    const vehicle = makeVehicle();
    repo.findById.mockResolvedValue(vehicle);

    const output = await sut.execute({ id: VEHICLE_UUID_1 });

    expect(output.id).toBe(vehicle.id().value);
    expect(output.customerId).toBe(vehicle.customerId);
    expect(output.brand).toBe(vehicle.brand);
    expect(output.model).toBe(vehicle.model);
    expect(output.year).toBe(vehicle.year);
    expect(output.createdAt).toBe(vehicle.createdAt);
    expect(output.updatedAt).toBe(vehicle.updatedAt);
  });

  it('should return old plate formatted with dash', async () => {
    const vehicle = makeVehicle();
    repo.findById.mockResolvedValue(vehicle);

    const output = await sut.execute({ id: VEHICLE_UUID_1 });

    expect(output.licensePlate).toBe('ABC-1234');
    expect(output.licensePlateType).toBe('old');
  });

  it('should return Mercosul plate without dash', async () => {
    const vehicle = makeVehicle({
      licensePlate: LicensePlate.create(VALID_PLATE_MERCOSUL),
    });
    repo.findById.mockResolvedValue(vehicle);

    const output = await sut.execute({ id: VEHICLE_UUID_1 });

    expect(output.licensePlate).toBe('ABC1D23');
    expect(output.licensePlateType).toBe('mercosul');
  });

  it('should call findById with the correct VehicleId', async () => {
    const vehicle = makeVehicle();
    repo.findById.mockResolvedValue(vehicle);

    await sut.execute({ id: VEHICLE_UUID_1 });

    const [calledId] = repo.findById.mock.calls[0];
    expect(calledId.value).toBe(VEHICLE_UUID_1);
  });

  it('should throw NotFoundException if vehicle does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute({ id: VEHICLE_UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
  });
});
