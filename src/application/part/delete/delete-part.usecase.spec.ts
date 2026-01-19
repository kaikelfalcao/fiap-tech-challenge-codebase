import { DeletePartUseCase } from './delete-part.usecase';
import { NotFoundError } from '@shared/errors/not-found.error';

describe('DeletePartUseCase', () => {
  let mockRepo: any;
  let useCase: DeletePartUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeletePartUseCase(mockRepo);
  });

  it('should delete part when it exists', async () => {
    mockRepo.findById.mockResolvedValue({ id: '1' });

    await useCase.execute({ id: '1' });

    expect(mockRepo.delete).toHaveBeenCalledWith('1');
  });

  it('should throw NotFoundError when part does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: '1' })).rejects.toThrow(NotFoundError);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });
});
