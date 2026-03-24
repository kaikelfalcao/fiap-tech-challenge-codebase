import {
  makeVehicleRepositoryMock,
  type VehicleRepositoryMock,
} from '../../helpers/vehicle-repository.mock';
import {
  makeVehicle,
  makeVehicleId,
  VEHICLE_UUID_1,
  VEHICLE_UUID_2,
} from '../../helpers/vehicle.factory';

import { UpdateVehicleUseCase } from './update-vehicle.use-case';

import { ConflictException } from '@/shared/domain/exceptions/conflict.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

const makeInput = (overrides = {}) => ({
  id: VEHICLE_UUID_1,
  brand: 'Honda',
  model: 'Civic',
  year: 2023,
  licensePlate: 'DEF5678',
  ...overrides,
});

describe('UpdateVehicleUseCase', () => {
  let sut: UpdateVehicleUseCase;
  let repo: VehicleRepositoryMock;

  beforeEach(() => {
    repo = makeVehicleRepositoryMock();
    sut = new UpdateVehicleUseCase(repo);
  });

  it('should update all provided attributes', async () => {
    const vehicle = makeVehicle();
    repo.findById.mockResolvedValue(vehicle);
    repo.findByLicensePlate.mockResolvedValue(null);
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    expect(vehicle.brand).toBe('Honda');
    expect(vehicle.model).toBe('Civic');
    expect(vehicle.year).toBe(2023);
    expect(vehicle.licensePlate.raw).toBe('DEF5678');
  });

  it('should call update with the modified vehicle', async () => {
    const vehicle = makeVehicle();
    repo.findById.mockResolvedValue(vehicle);
    repo.findByLicensePlate.mockResolvedValue(null);
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith(vehicle);
  });

  it('should update only the provided fields', async () => {
    const vehicle = makeVehicle({ year: 2022, model: 'Corolla' });
    const originalModel = vehicle.model;
    const originalPlate = vehicle.licensePlate.raw;
    repo.findById.mockResolvedValue(vehicle);
    repo.update.mockResolvedValue();

    await sut.execute({ id: VEHICLE_UUID_1, year: 2023 });

    expect(vehicle.year).toBe(2023);
    expect(vehicle.model).toBe(originalModel);
    expect(vehicle.licensePlate.raw).toBe(originalPlate);
  });

  it('should allow updating to the same license plate (no conflict)', async () => {
    const vehicle = makeVehicle();
    repo.findById.mockResolvedValue(vehicle);
    repo.findByLicensePlate.mockResolvedValue(vehicle); // returns same vehicle
    repo.update.mockResolvedValue();

    await sut.execute(makeInput({ licensePlate: vehicle.licensePlate.raw }));

    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('should throw ConflictException if plate belongs to another vehicle', async () => {
    const vehicle = makeVehicle();
    const otherVehicle = makeVehicle({ id: makeVehicleId(VEHICLE_UUID_2) });
    repo.findById.mockResolvedValue(vehicle);
    repo.findByLicensePlate.mockResolvedValue(otherVehicle);

    await expect(sut.execute(makeInput())).rejects.toThrow(ConflictException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if license plate format is invalid', async () => {
    const vehicle = makeVehicle();
    repo.findById.mockResolvedValue(vehicle);

    await expect(
      sut.execute(makeInput({ licensePlate: 'INVALID' })),
    ).rejects.toThrow(ValidationException);

    expect(repo.findByLicensePlate).not.toHaveBeenCalled();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if vehicle does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should call findById with the correct VehicleId', async () => {
    const vehicle = makeVehicle();
    repo.findById.mockResolvedValue(vehicle);
    repo.findByLicensePlate.mockResolvedValue(null);
    repo.update.mockResolvedValue();

    await sut.execute(makeInput({ id: VEHICLE_UUID_1 }));

    const [calledId] = repo.findById.mock.calls[0];
    expect(calledId.value).toBe(VEHICLE_UUID_1);
  });

  it('should not call update when findById throws', async () => {
    repo.findById.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(repo.update).not.toHaveBeenCalled();
  });
});
