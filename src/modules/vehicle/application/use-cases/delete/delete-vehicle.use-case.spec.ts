import {
  makeVehicleRepositoryMock,
  type VehicleRepositoryMock,
} from '../../helpers/vehicle-repository.mock';
import { makeVehicle, VEHICLE_UUID_1 } from '../../helpers/vehicle.factory';

import { DeleteVehicleUseCase } from './delete-vehicle.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('DeleteVehicleUseCase', () => {
  let sut: DeleteVehicleUseCase;
  let repo: VehicleRepositoryMock;

  beforeEach(() => {
    repo = makeVehicleRepositoryMock();
    sut = new DeleteVehicleUseCase(repo);
  });

  it('should delete an existing vehicle', async () => {
    const vehicle = makeVehicle();
    repo.findById.mockResolvedValue(vehicle);
    repo.delete.mockResolvedValue();

    await sut.execute({ id: VEHICLE_UUID_1 });

    expect(repo.delete).toHaveBeenCalledTimes(1);
  });

  it('should call delete with the correct VehicleId', async () => {
    const vehicle = makeVehicle();
    repo.findById.mockResolvedValue(vehicle);
    repo.delete.mockResolvedValue();

    await sut.execute({ id: VEHICLE_UUID_1 });

    const [calledId] = repo.delete.mock.calls[0];
    expect(calledId.value).toBe(VEHICLE_UUID_1);
  });

  it('should call findById with the correct VehicleId', async () => {
    const vehicle = makeVehicle();
    repo.findById.mockResolvedValue(vehicle);
    repo.delete.mockResolvedValue();

    await sut.execute({ id: VEHICLE_UUID_1 });

    const [calledId] = repo.findById.mock.calls[0];
    expect(calledId.value).toBe(VEHICLE_UUID_1);
  });

  it('should throw NotFoundException if vehicle does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute({ id: VEHICLE_UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('should not call delete when findById throws', async () => {
    repo.findById.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({ id: VEHICLE_UUID_1 })).rejects.toThrow(
      'Database error',
    );
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('should call ensureCanBeDeleted before deleting', async () => {
    const vehicle = makeVehicle();
    const spy = jest.spyOn(vehicle, 'ensureCanBeDeleted');
    repo.findById.mockResolvedValue(vehicle);
    repo.delete.mockResolvedValue();

    await sut.execute({ id: VEHICLE_UUID_1 });

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
