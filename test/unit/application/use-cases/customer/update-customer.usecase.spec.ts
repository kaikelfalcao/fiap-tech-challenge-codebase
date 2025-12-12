import {
  UpdateCustomerInput,
  UpdateCustomerUseCase,
} from '../../../../../src/application/use-cases/customer/update-customer.usecase';
import { ICustomerRepository } from '../../../../../src/domain/repositories/customer.repository';
import { Customer } from '../../../../../src/domain/entities/customer.entity';
import { UUID } from 'node:crypto';

describe('UpdateCustomerUseCase', () => {
  let useCase: UpdateCustomerUseCase;
  let repository: jest.Mocked<ICustomerRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByDocument: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new UpdateCustomerUseCase(repository);
  });

  it('should update customer fields', async () => {
    const customer = Customer.create({
      name: 'Old',
      email: 'old@test.com',
      document: '36801082060',
    });
    repository.findById.mockResolvedValue(customer);
    repository.update.mockResolvedValue(customer);

    const input: UpdateCustomerInput = {
      id: <UUID>customer.id,
      name: 'New',
      email: 'new@test.com',
    };
    const result = await useCase.execute(input);

    expect(repository.findById).toHaveBeenCalledWith(customer.id);
    expect(repository.update).toHaveBeenCalledWith(customer);
    expect(result.name).toBe('New');
    expect(result.email.value).toBe('new@test.com');
  });

  it('should throw error if customer not found', async () => {
    repository.findById.mockResolvedValue(null);
    const input: UpdateCustomerInput = { id: <UUID>'any-id', name: 'New' };
    await expect(useCase.execute(input)).rejects.toThrow('Customer not found');
  });
});
