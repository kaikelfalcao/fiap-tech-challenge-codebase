import { DeleteCustomerUseCase } from '../../../../../src/application/use-cases/customer/delete-customer.usecase';
import { ICustomerRepository } from '../../../../../src/domain/repositories/customer.repository';
import { UUID } from 'node:crypto';


describe('DeleteCustomerUseCase', () => {
  let useCase: DeleteCustomerUseCase;
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
    useCase = new DeleteCustomerUseCase(repository);
  });

  it('should delete a customer', async () => {
    repository.delete.mockResolvedValue(undefined);
    const result = await useCase.execute(<UUID>'any-id');

    expect(repository.delete).toHaveBeenCalledWith('any-id');
    expect(result).toBe(true);
  });
});
