import { Repair } from '@domain/repair/repair.entity';
import { NotFoundError } from '@shared/errors/not-found.error';
import { FindRepairUseCase } from './find-repair.usecase';

describe('FindRepairUseCase', () => {
  let mockRepo: any;
  let useCase: FindRepairUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
    };

    useCase = new FindRepairUseCase(mockRepo);
  });

  it('should return repair when found', async () => {
    const repair = Repair.create('Brake repair', 300);

    mockRepo.findById.mockResolvedValue(repair);

    const result = await useCase.execute({ id: 'repair-id' });

    expect(result).toBe(repair);
    expect(mockRepo.findById).toHaveBeenCalledWith('repair-id');
  });

  it('should throw NotFoundError when repair is not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'repair-id' })).rejects.toThrow(
      NotFoundError,
    );
  });
});
