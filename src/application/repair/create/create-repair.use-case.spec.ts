import { Repair } from '@domain/repair/repair.entity';
import { CreateRepairUseCase } from './create-repair.usecase';

describe('CreateRepairUseCase', () => {
  let mockRepo: any;
  let useCase: CreateRepairUseCase;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn(),
    };

    useCase = new CreateRepairUseCase(mockRepo);
  });

  it('should create and save a repair', async () => {
    const input = {
      description: 'Oil change',
      cost: 150,
    };

    mockRepo.save.mockResolvedValue(undefined);

    const repair = await useCase.execute(input);

    expect(repair).toBeInstanceOf(Repair);
    expect(repair.description).toBe(input.description);
    expect(repair.cost).toBe(input.cost);
    expect(mockRepo.save).toHaveBeenCalledWith(repair);
  });
});
