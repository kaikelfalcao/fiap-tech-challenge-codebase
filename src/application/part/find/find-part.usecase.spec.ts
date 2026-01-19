import { FindPartUseCase } from './find-part.usecase';
import { InvalidInputError } from '@shared/errors/invalid-input.error';

describe('FindPartUseCase', () => {
  let mockRepo: any;
  let useCase: FindPartUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findBySku: jest.fn(),
    };

    useCase = new FindPartUseCase(mockRepo);
  });

  it('should find part by id', async () => {
    const part = { id: '1' };
    mockRepo.findById.mockResolvedValue(part);

    const result = await useCase.execute({ id: '1' });

    expect(result).toBe(part);
  });

  it('should find part by sku', async () => {
    const part = { sku: 'SKU-1' };
    mockRepo.findBySku.mockResolvedValue(part);

    const result = await useCase.execute({ sku: 'SKU-1' });

    expect(result).toBe(part);
  });

  it('should throw InvalidInputError when no identifier is provided', async () => {
    await expect(useCase.execute({})).rejects.toThrow(InvalidInputError);
  });
});
