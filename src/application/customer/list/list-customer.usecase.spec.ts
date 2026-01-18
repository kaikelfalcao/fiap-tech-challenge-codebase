import { Customer } from '@domain/customer/customer.entity';
import { ListCustomerUseCase } from './list-customer.usecase';

describe('ListCustomerUseCase', () => {
  let mockRepo: any;
  let useCase: ListCustomerUseCase;

  beforeEach(() => {
    mockRepo = {
      count: jest.fn(),
      findAll: jest.fn(),
    };

    useCase = new ListCustomerUseCase(mockRepo);
  });

  it('should list customers with default pagination', async () => {
    const customers = [
      Customer.create('John', 'john@example.com', '12345678909', '1'),
      Customer.create('Jane', 'jane@example.com', '98765432100', '2'),
    ];

    mockRepo.count.mockResolvedValue(2);
    mockRepo.findAll.mockResolvedValue(customers);

    const result = await useCase.execute();

    expect(result.data).toEqual(customers);
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    expect(mockRepo.count).toHaveBeenCalled();
    expect(mockRepo.findAll).toHaveBeenCalledWith({
      skip: 0,
      take: 20,
    });
  });

  it('should list customers with provided pagination params', async () => {
    const customers = [
      Customer.create('John', 'john@example.com', '12345678909', '1'),
    ];

    mockRepo.count.mockResolvedValue(10);
    mockRepo.findAll.mockResolvedValue(customers);

    const result = await useCase.execute({
      page: 2,
      pageSize: 5,
    });

    expect(result.data).toEqual(customers);
    expect(result.meta).toEqual({
      total: 10,
      page: 2,
      pageSize: 5,
      totalPages: 2,
    });

    expect(mockRepo.findAll).toHaveBeenCalledWith({
      skip: 5,
      take: 5,
    });
  });

  it('should normalize invalid pagination params', async () => {
    mockRepo.count.mockResolvedValue(0);
    mockRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute({
      page: 0,
      pageSize: -10,
    });

    expect(result.meta.page).toBe(1);
    expect(result.meta.pageSize).toBe(1);
    expect(result.meta.totalPages).toBe(0);

    expect(mockRepo.findAll).toHaveBeenCalledWith({
      skip: 0,
      take: 1,
    });
  });
});
