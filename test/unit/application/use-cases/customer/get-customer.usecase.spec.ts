import { GetCustomerUseCase } from '../../../../../src/application/use-cases/customer/get-customer.usecase';
import { ICustomerRepository } from '../../../../../src/domain/repositories/customer.repository';
import { Customer } from '../../../../../src/domain/entities/customer.entity';
import { NotFoundException } from '@nestjs/common';

describe('GetCustomerUseCase', () => {
  let useCase: GetCustomerUseCase;
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
    useCase = new GetCustomerUseCase(repository);
  });

  it('should return a customer when found', async () => {
    const customer = Customer.create({
      name: 'Kaike',
      email: 'kaike@test.com',
      document: '36801082060',
    });
    repository.findById.mockResolvedValue(customer);

    const result = await useCase.execute('any-id');

    expect(repository.findById).toHaveBeenCalledWith('any-id');
    expect(result).toBe(customer);
  });

  it('should throw NotFoundException when not found', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(useCase.execute('any-id')).rejects.toThrow(NotFoundException);
  });
});
