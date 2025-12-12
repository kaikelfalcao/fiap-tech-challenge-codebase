import { GetCustomerByEmailUseCase } from '../../../../../src/application/use-cases/customer/get-customer-by-email.usecase';
import { ICustomerRepository } from '../../../../../src/domain/repositories/customer.repository';
import { Customer } from '../../../../../src/domain/entities/customer.entity';
import { NotFoundException } from '@nestjs/common';

describe('GetCustomerByEmailUseCase', () => {
  let useCase: GetCustomerByEmailUseCase;
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

    useCase = new GetCustomerByEmailUseCase(repository);
  });

  it('should return a customer when found', async () => {
    const customer = Customer.create({
      name: 'Kaike',
      email: 'kaike@test.com',
      document: '36801082060',
    });

    repository.findByEmail.mockResolvedValue(customer);

    const result = await useCase.execute('kaike@test.com');

    expect(repository.findByEmail).toHaveBeenCalledWith('kaike@test.com');
    expect(result).toBe(customer);
  });

  it('should throw NotFoundException when not found', async () => {
    repository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute('notfound@test.com')).rejects.toThrow(
      NotFoundException,
    );
  });
});
