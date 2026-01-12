import { Vehicle } from 'src/domain/entities/vehicle.entity';
import { CreateVehicleUseCase } from '../vehicle/create-vehicle.usecase';
import { DeleteVehicleUseCase } from '../vehicle/delete-vehicle.usecase';
import { UpdateVehicleUseCase } from '../vehicle/update-vehicle.usecase';
import { FindVehicleUseCase } from '../vehicle/find-vehicle.usecase';
import { FindAllVehiclesUseCase } from '../vehicle/find-all-vehicles.usecase';
import type { VehicleRepository } from 'src/domain/repositories/vehicle.repository';

function makeVehicleRepository(): jest.Mocked<VehicleRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
    findByPlate: jest.fn(),
    findAll: jest.fn(),
  };
}

describe('Vehicle UseCases', () => {
  const validVehicleInput = {
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    plate: 'ABC1234',
    customerId: 'cust-001',
  };

  describe('CreateVehicleUseCase', () => {
    it('should create a new vehicle', async () => {
      const repo = makeVehicleRepository();
      repo.save.mockResolvedValue();

      const useCase = new CreateVehicleUseCase(repo);
      const vehicle = await useCase.execute(validVehicleInput);

      expect(vehicle).toBeInstanceOf(Vehicle);
      expect(vehicle.brand).toBe(validVehicleInput.brand);
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(vehicle);
    });

    it('should throw error if plate is invalid', async () => {
      const repo = makeVehicleRepository();
      const useCase = new CreateVehicleUseCase(repo);

      await expect(
        useCase.execute({ ...validVehicleInput, plate: 'INVALID' }),
      ).rejects.toThrow('Invalid Plate');
    });
  });

  describe('DeleteVehicleUseCase', () => {
    it('should delete vehicle by id', async () => {
      const repo = makeVehicleRepository();
      const vehicle = Vehicle.create(
        'Ford',
        'Fiesta',
        2018,
        'XYZ1234',
        'cust-002',
      );
      repo.findById.mockResolvedValue(vehicle);
      repo.delete.mockResolvedValue();

      const useCase = new DeleteVehicleUseCase(repo);
      await useCase.execute({ id: vehicle.id });

      expect(repo.findById).toHaveBeenCalledWith(vehicle.id);
      expect(repo.delete).toHaveBeenCalledWith(vehicle.id);
    });

    it('should throw if vehicle not found', async () => {
      const repo = makeVehicleRepository();
      repo.findById.mockResolvedValue(null);

      const useCase = new DeleteVehicleUseCase(repo);
      await expect(useCase.execute({ id: 'nonexistent-id' })).rejects.toThrow();
    });
  });

  describe('UpdateVehicleUseCase', () => {
    it('should update vehicle brand', async () => {
      const repo = makeVehicleRepository();
      const vehicle = Vehicle.create(
        'Honda',
        'Civic',
        2019,
        'DEF1234',
        'cust-003',
      );
      repo.findById.mockResolvedValue(vehicle);
      repo.save.mockResolvedValue();

      const useCase = new UpdateVehicleUseCase(repo);
      const updatedVehicle = await useCase.execute({
        id: vehicle.id,
        brand: 'Honda Updated',
      });

      expect(updatedVehicle.brand).toBe('Honda Updated');
      expect(repo.save).toHaveBeenCalledWith(vehicle);
    });

    it('should throw if vehicle not found', async () => {
      const repo = makeVehicleRepository();
      repo.findById.mockResolvedValue(null);

      const useCase = new UpdateVehicleUseCase(repo);
      await expect(
        useCase.execute({ id: 'nonexistent-id', brand: 'Test' }),
      ).rejects.toThrow();
    });
  });

  describe('FindVehicleUseCase', () => {
    it('should find vehicle by id', async () => {
      const repo = makeVehicleRepository();
      const vehicle = Vehicle.create(
        'Nissan',
        'Sentra',
        2021,
        'GHI1234',
        'cust-004',
      );
      repo.findById.mockResolvedValue(vehicle);

      const useCase = new FindVehicleUseCase(repo);
      const found = await useCase.execute({ id: vehicle.id });

      expect(found).toBe(vehicle);
      expect(repo.findById).toHaveBeenCalledWith(vehicle.id);
    });
  });

  describe('FindAllVehiclesUseCase', () => {
    it('should return all vehicles', async () => {
      const repo = makeVehicleRepository();
      const vehicles = [
        Vehicle.create('Ford', 'Focus', 2017, 'JKL1234', 'cust-005'),
        Vehicle.create('Chevrolet', 'Onix', 2019, 'MNO1234', 'cust-006'),
      ];
      repo.findAll.mockResolvedValue(vehicles);

      const useCase = new FindAllVehiclesUseCase(repo);
      const result = await useCase.execute();

      expect(result).toEqual(vehicles);
      expect(repo.findAll).toHaveBeenCalled();
    });
  });
});
