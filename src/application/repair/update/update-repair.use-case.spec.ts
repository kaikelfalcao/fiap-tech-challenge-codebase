import { Repair } from '@domain/repair/repair.entity';
import { UpdateRepairUseCase } from './update-repair.usecase';

describe('UpdateRepairUseCase', () => {
  let mockRepo: any;
  let useCase: UpdateRepairUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    useCase = new UpdateRepairUseCase(mockRepo);
  });

  it('should update repair fields', async () => {
    const repair = Repair.create('Old description', 100);

    mockRepo.findById.mockResolvedValue(repair);

    const result = await useCase.execute({
      id: 'repair-id',
      description: 'New description',
      cost: 200,
    });

    expect(result.description).toBe('New description');
    expect(result.cost).toBe(200);
    expect(mockRepo.update).toHaveBeenCalledWith(repair);
  });

  it('should throw error when repair does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'repair-id', cost: 200 }),
    ).rejects.toThrow('Repair not found');

    expect(mockRepo.update).not.toHaveBeenCalled();
  });
});
