import { ListPartUseCase } from './list-part.usecase';
import { Part } from '@domain/part/part.entity';

describe('ListPartUseCase', () => {
  let mockRepo: any;
  let useCase: ListPartUseCase;

  beforeEach(() => {
    mockRepo = {
      count: jest.fn(),
      findAll: jest.fn(),
    };

    useCase = new ListPartUseCase(mockRepo);
  });

  it('should list parts with default pagination', async () => {
    const parts = [
      { id: '1', name: 'Oil Filter' } as Part,
      { id: '2', name: 'Air Filter' } as Part,
    ];

    mockRepo.count.mockResolvedValue(2);
    mockRepo.findAll.mockResolvedValue(parts);

    const result = await useCase.execute();

    expect(mockRepo.count).toHaveBeenCalled();
    expect(mockRepo.findAll).toHaveBeenCalledWith({
      skip: 0,
      take: 20,
    });

    expect(result).toEqual({
      data: parts,
      meta: {
        total: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      },
    });
  });

  it('should apply custom pagination params', async () => {
    const parts = [{ id: '3', name: 'Brake Pad' } as Part];

    mockRepo.count.mockResolvedValue(50);
    mockRepo.findAll.mockResolvedValue(parts);

    const result = await useCase.execute({ page: 2, pageSize: 10 });

    expect(mockRepo.findAll).toHaveBeenCalledWith({
      skip: 10,
      take: 10,
    });

    expect(result.meta).toEqual({
      total: 50,
      page: 2,
      pageSize: 10,
      totalPages: 5,
    });
  });

  it('should not allow page or pageSize less than 1', async () => {
    mockRepo.count.mockResolvedValue(0);
    mockRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute({ page: 0, pageSize: 0 });

    expect(mockRepo.findAll).toHaveBeenCalledWith({
      skip: 0,
      take: 1,
    });

    expect(result.meta.page).toBe(1);
    expect(result.meta.pageSize).toBe(1);
  });
});
