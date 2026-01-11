import { Customer } from 'src/domain/entities/customer.entity';
import { DeleteCustomerUseCase } from '../delete-customer.usecase';
import { makeCustomerRepository } from './customer.repository.mock';

describe('DeleteCustomerUseCase', () => {
  it('should delete customer when it exists', async () => {
    const repo = makeCustomerRepository();

    repo.findById.mockResolvedValue({ id: 'customer-id-1' } as Customer);

    const useCase = new DeleteCustomerUseCase(repo);

    await useCase.execute({ id: 'customer-id-1' });

    expect(repo.findById).toHaveBeenCalledWith('customer-id-1');
    expect(repo.delete).toHaveBeenCalledWith('customer-id-1');
  });

  it('should throw error when customer does not exist', async () => {
    const repo = makeCustomerRepository();
    repo.findById.mockResolvedValue(null);

    const useCase = new DeleteCustomerUseCase(repo);

    await expect(useCase.execute({ id: 'invalid-id' })).rejects.toThrow(
      'Customer not found',
    );

    expect(repo.delete).not.toHaveBeenCalled();
  });
});
