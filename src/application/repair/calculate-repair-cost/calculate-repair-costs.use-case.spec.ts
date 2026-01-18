import { CalculateRepairCostsUseCase } from './calculate-repair-cost.usecase';

describe('CalculateRepairCostsUseCase', () => {
  let mockRepo: any;
  let useCase: CalculateRepairCostsUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
    };

    useCase = new CalculateRepairCostsUseCase(mockRepo);
  });

  it('should calculate total cost and processed repairs', async () => {
    mockRepo.findById
      .mockResolvedValueOnce({ id: '1', cost: 100 })
      .mockResolvedValueOnce({ id: '2', cost: 200 });

    const result = await useCase.execute([
      { repairId: '1' },
      { repairId: '2' },
    ]);

    expect(result.processed).toEqual([
      { repairId: '1', costAtTime: 100 },
      { repairId: '2', costAtTime: 200 },
    ]);

    expect(result.totalCost).toBe(300);
    expect(mockRepo.findById).toHaveBeenCalledTimes(2);
  });

  it('should throw error when repair is not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute([{ repairId: 'invalid-id' }])).rejects.toThrow(
      'Reparo invalid-id não encontrado',
    );
  });
});
