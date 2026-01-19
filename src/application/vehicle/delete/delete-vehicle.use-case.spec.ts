import { NotFoundError } from '@shared/errors/not-found.error';
import { DeleteVehicleUseCase } from './delete-vehicle.usecase';

describe('DeleteVehicleUseCase', () => {
  let mockRepo: any;
  let useCase: DeleteVehicleUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteVehicleUseCase(mockRepo);
  });

  it('should delete vehicle when it exists', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'vehicle-id' });

    await useCase.execute({ id: 'vehicle-id' });

    expect(mockRepo.findById).toHaveBeenCalledWith('vehicle-id');
    expect(mockRepo.delete).toHaveBeenCalledWith('vehicle-id');
  });

  it('should throw NotFoundError when vehicle does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'vehicle-id' })).rejects.toThrow(
      NotFoundError,
    );

    expect(mockRepo.delete).not.toHaveBeenCalled();
  });
});
