import { Repair } from '@domain/repair/repair.entity';
import { ListRepairUseCase } from './list-repair.usecase';

describe('ListRepairUseCase', () => {
  let mockRepo: any;
  let useCase: ListRepairUseCase;

  beforeEach(() => {
    mockRepo = {
      count: jest.fn(),
      findAll: jest.fn(),
    };

    useCase = new ListRepairUseCase(mockRepo);
  });

  it('should list repairs with default pagination', async () => {
    const repairs = [
      Repair.create('Oil change', 100),
      Repair.create('Brake repair', 300),
    ];

    mockRepo.count.mockResolvedValue(2);
    mockRepo.findAll.mockResolvedValue(repairs);

    const result = await useCase.execute();

    expect(result.data).toEqual(repairs);
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    expect(mockRepo.findAll).toHaveBeenCalledWith({
      skip: 0,
      take: 20,
    });
  });

  it('should normalize invalid pagination params', async () => {
    mockRepo.count.mockResolvedValue(0);
    mockRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute({ page: 0, pageSize: -5 });

    expect(result.meta.page).toBe(1);
    expect(result.meta.pageSize).toBe(1);
    expect(result.meta.totalPages).toBe(0);
  });
});
