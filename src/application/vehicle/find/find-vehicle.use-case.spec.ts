import { Vehicle } from '@domain/vehicle/vehicle.entity';
import { InvalidInputError } from '@shared/errors/invalid-input.error';
import { NotFoundError } from '@shared/errors/not-found.error';
import { FindVehicleUseCase } from './find-vehicle.usecase';

describe('FindVehicleUseCase', () => {
  let mockRepo: any;
  let useCase: FindVehicleUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findByPlate: jest.fn(),
    };

    useCase = new FindVehicleUseCase(mockRepo);
  });

  it('should throw InvalidInputError when no params are provided', async () => {
    await expect(useCase.execute({})).rejects.toThrow(InvalidInputError);
  });

  it('should find vehicle by id', async () => {
    const vehicle = Vehicle.create(
      'Toyota',
      'Corolla',
      2022,
      'ABC1234',
      'customer-id',
    );

    mockRepo.findById.mockResolvedValue(vehicle);

    const result = await useCase.execute({ id: 'vehicle-id' });

    expect(result).toBe(vehicle);
    expect(mockRepo.findById).toHaveBeenCalledWith('vehicle-id');
    expect(mockRepo.findByPlate).not.toHaveBeenCalled();
  });

  it('should find vehicle by plate when id is not found', async () => {
    const vehicle = Vehicle.create(
      'Toyota',
      'Corolla',
      2022,
      'ABC1234',
      'customer-id',
    );

    mockRepo.findById.mockResolvedValue(null);
    mockRepo.findByPlate.mockResolvedValue(vehicle);

    const result = await useCase.execute({ plate: 'ABC1234' });

    expect(result).toBe(vehicle);
    expect(mockRepo.findByPlate).toHaveBeenCalledWith('ABC1234');
  });

  it('should throw NotFoundError when vehicle is not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    mockRepo.findByPlate.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'vehicle-id' })).rejects.toThrow(
      NotFoundError,
    );
  });
});
