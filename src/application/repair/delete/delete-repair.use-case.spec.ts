import { NotFoundError } from '@shared/errors/not-found.error';
import { DeleteRepairUseCase } from './delete-repair.usecase';

describe('DeleteRepairUseCase', () => {
  let mockRepo: any;
  let useCase: DeleteRepairUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteRepairUseCase(mockRepo);
  });

  it('should delete repair when it exists', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'repair-id' });

    await useCase.execute({ id: 'repair-id' });

    expect(mockRepo.findById).toHaveBeenCalledWith('repair-id');
    expect(mockRepo.delete).toHaveBeenCalledWith('repair-id');
  });

  it('should throw NotFoundError when repair does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'repair-id' })).rejects.toThrow(
      NotFoundError,
    );

    expect(mockRepo.delete).not.toHaveBeenCalled();
  });
});
