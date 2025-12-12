import { GetCustomerByDocumentUseCase } from '../../../../../src/application/use-cases/customer/get-customer-by-document.usecase';
import { ICustomerRepository } from '../../../../../src/domain/repositories/customer.repository';
import { Customer } from '../../../../../src/domain/entities/customer.entity';
import { NotFoundException } from '@nestjs/common';

describe('GetCustomerByDocumentUseCase', () => {
  let useCase: GetCustomerByDocumentUseCase;
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

    useCase = new GetCustomerByDocumentUseCase(repository);
  });

  it('should return a customer when found', async () => {
    const customer = Customer.create({
      name: 'Kaike',
      email: 'kaike@test.com',
      document: '36801082060',
    });

    repository.findByDocument.mockResolvedValue(customer);

    const result = await useCase.execute('36801082060');

    expect(repository.findByDocument).toHaveBeenCalledWith('36801082060');
    expect(result).toBe(customer);
  });

  it('should throw NotFoundException when not found', async () => {
    repository.findByDocument.mockResolvedValue(null);

    await expect(useCase.execute('00000000000')).rejects.toThrow(
      NotFoundException,
    );
  });
});
