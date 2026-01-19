import { ReturnPartUseCase } from './return-part.usecase';
import { InvalidInputError } from '@shared/errors/invalid-input.error';

describe('ReturnPartUseCase', () => {
  let mockRepo: any;
  let useCase: ReturnPartUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    useCase = new ReturnPartUseCase(mockRepo);
  });

  it('should return parts and update stock', async () => {
    const part = {
      id: '1',
      price: 50,
      quantity: 5,
      changeQuantity: jest.fn(),
    };

    mockRepo.findById.mockResolvedValue(part);

    const result = await useCase.execute([{ partId: '1', quantity: 2 }]);

    expect(part.changeQuantity).toHaveBeenCalledWith(7);
    expect(result.totalValue).toBe(100);
  });

  it('should throw InvalidInputError if part does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute([{ partId: '1', quantity: 1 }]),
    ).rejects.toThrow(InvalidInputError);
  });
});
