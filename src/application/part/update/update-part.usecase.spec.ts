import { UpdatePartUseCase } from './update-part.usecase';
import { NotFoundError } from '@shared/errors/not-found.error';

describe('UpdatePartUseCase', () => {
  let mockRepo: any;
  let useCase: UpdatePartUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    useCase = new UpdatePartUseCase(mockRepo);
  });

  it('should update part fields', async () => {
    const part = {
      changeName: jest.fn(),
      changeSku: jest.fn(),
      changePrice: jest.fn(),
      changeQuantity: jest.fn(),
    };

    mockRepo.findById.mockResolvedValue(part);

    const result = await useCase.execute({
      id: '1',
      name: 'New Name',
      price: 100,
    });

    expect(part.changeName).toHaveBeenCalledWith('New Name');
    expect(part.changePrice).toHaveBeenCalledWith(100);
    expect(mockRepo.update).toHaveBeenCalledWith(part);
    expect(result).toBe(part);
  });

  it('should throw NotFoundError if part does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: '1' })).rejects.toThrow(NotFoundError);
  });
});
