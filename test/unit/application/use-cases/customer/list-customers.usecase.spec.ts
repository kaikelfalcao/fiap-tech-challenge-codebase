import { ListCustomersUseCase } from '../../../../../src/application/use-cases/customer/list-customers.usecase';
import { ICustomerRepository } from '../../../../../src/domain/repositories/customer.repository';
import { Customer } from '../../../../../src/domain/entities/customer.entity';

describe('ListCustomersUseCase', () => {
  let useCase: ListCustomersUseCase;
  let repository: jest.Mocked<ICustomerRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByDocument: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new ListCustomersUseCase(repository);
  });

  it('should return all customers', async () => {
    const customers = [
      Customer.create({
        name: 'A',
        email: 'a@test.com',
        document: '591.531.050-87',
      }),
      Customer.create({
        name: 'B',
        email: 'b@test.com',
        document: '902.118.430-32',
      }),
    ];
    repository.findAll.mockResolvedValue(customers);

    const result = await useCase.execute();

    expect(repository.findAll).toHaveBeenCalled();
    expect(result).toBe(customers);
  });
});
