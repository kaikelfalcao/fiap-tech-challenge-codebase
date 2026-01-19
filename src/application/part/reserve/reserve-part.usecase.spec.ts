import { ReservePartUseCase } from './reserve-part.usecase';
import { InvalidInputError } from '@shared/errors/invalid-input.error';
import { InsufficientStockPort } from '../errors/insufficient-stock-part.error';

describe('ReservePartUseCase', () => {
  let mockRepo: any;
  let useCase: ReservePartUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    useCase = new ReservePartUseCase(mockRepo);
  });

  it('should reserve parts and calculate total cost', async () => {
    const part = {
      id: '1',
      name: 'Oil Filter',
      price: 50,
      quantity: 10,
      changeQuantity: jest.fn(),
    };

    mockRepo.findById.mockResolvedValue(part);

    const result = await useCase.execute([{ partId: '1', quantity: 2 }]);

    expect(part.changeQuantity).toHaveBeenCalledWith(8);
    expect(mockRepo.update).toHaveBeenCalledWith(part);

    expect(result.totalCost).toBe(100);
    expect(result.processed).toHaveLength(1);
  });

  it('should throw InvalidInputError when part does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute([{ partId: '1', quantity: 1 }]),
    ).rejects.toThrow(InvalidInputError);
  });

  it('should throw InsufficientStockPort when stock is insufficient', async () => {
    const part = {
      id: '1',
      name: 'Oil Filter',
      price: 50,
      quantity: 1,
    };

    mockRepo.findById.mockResolvedValue(part);

    await expect(
      useCase.execute([{ partId: '1', quantity: 5 }]),
    ).rejects.toThrow(InsufficientStockPort);
  });
});
