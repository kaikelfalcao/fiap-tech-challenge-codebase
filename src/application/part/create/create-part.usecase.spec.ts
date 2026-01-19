import { CreatePartUseCase } from './create-part.usecase';
import { InvalidInputError } from '@shared/errors/invalid-input.error';
import { Part } from '@domain/part/part.entity';

describe('CreatePartUseCase', () => {
  let mockRepo: any;
  let useCase: CreatePartUseCase;

  beforeEach(() => {
    mockRepo = {
      findBySku: jest.fn(),
      save: jest.fn(),
    };

    useCase = new CreatePartUseCase(mockRepo);
  });

  it('should create a part successfully', async () => {
    mockRepo.findBySku.mockResolvedValue(null);

    const part = await useCase.execute({
      name: 'Oil Filter',
      sku: 'OF-001',
      price: 50,
      quantity: 10,
    });

    expect(part).toBeInstanceOf(Part);
    expect(part.name).toBe('Oil Filter');
    expect(part.sku).toBe('OF-001');
    expect(part.price).toBe(50);
    expect(part.quantity).toBe(10);

    expect(mockRepo.save).toHaveBeenCalledWith(part);
  });

  it('should throw InvalidInputError if SKU already exists', async () => {
    mockRepo.findBySku.mockResolvedValue({});

    await expect(
      useCase.execute({
        name: 'Oil Filter',
        sku: 'OF-001',
        price: 50,
      }),
    ).rejects.toThrow(InvalidInputError);

    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
