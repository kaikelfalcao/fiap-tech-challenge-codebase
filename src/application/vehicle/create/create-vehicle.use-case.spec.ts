import { Vehicle } from '@domain/vehicle/vehicle.entity';
import { CreateVehicleUseCase } from './create-vehicle.usecase';

describe('CreateVehicleUseCase', () => {
  let mockRepo: any;
  let useCase: CreateVehicleUseCase;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn(),
    };

    useCase = new CreateVehicleUseCase(mockRepo);
  });

  it('should create and save a vehicle', async () => {
    const input = {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      plate: 'ABC1234',
      customerId: 'customer-id',
    };

    mockRepo.save.mockResolvedValue(undefined);

    const vehicle = await useCase.execute(input);

    expect(vehicle).toBeInstanceOf(Vehicle);
    expect(vehicle.brand).toBe(input.brand);
    expect(vehicle.model).toBe(input.model);
    expect(vehicle.year).toBe(input.year);
    expect(vehicle.plate.value).toBe(input.plate);
    expect(vehicle.customerId).toBe(input.customerId);

    expect(mockRepo.save).toHaveBeenCalledWith(vehicle);
  });
});
