import { Vehicle } from '@domain/vehicle/vehicle.entity';
import { VehicleNotFound } from '@domain/vehicle/vehicle-not-found.error';
import { UpdateVehicleUseCase } from './update-vehicle.usecase';

describe('UpdateVehicleUseCase', () => {
  let mockRepo: any;
  let useCase: UpdateVehicleUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    useCase = new UpdateVehicleUseCase(mockRepo);
  });

  it('should throw VehicleNotFound when vehicle does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'vehicle-id', brand: 'Ford' }),
    ).rejects.toThrow(VehicleNotFound);

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should update vehicle fields', async () => {
    const vehicle = Vehicle.create(
      'Toyota',
      'Corolla',
      2020,
      'ABC1234',
      'customer-id',
    );

    mockRepo.findById.mockResolvedValue(vehicle);

    const result = await useCase.execute({
      id: 'vehicle-id',
      brand: 'Honda',
      model: 'Civic',
      year: 2023,
      plate: 'XYZ9999',
    });

    expect(result.brand).toBe('Honda');
    expect(result.model).toBe('Civic');
    expect(result.year).toBe(2023);
    expect(result.plate.value).toBe('XYZ9999');
    expect(mockRepo.save).toHaveBeenCalledWith(vehicle);
  });
});
