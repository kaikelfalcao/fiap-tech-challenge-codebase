import { Customer } from 'src/domain/entities/customer.entity';
import { UpdateCustomerUseCase } from '../update-customer.usecase';
import { makeCustomerRepository } from './customer.repository.mock';

describe('UpdateCustomerUseCase', () => {
  let customer: Customer;

  beforeEach(() => {
    customer = Customer.create(
      'John Doe',
      'john.doe@email.com',
      '52998224725',
      'customer-id-1',
    );
  });

  it('should update customer name', async () => {
    const repo = makeCustomerRepository();
    repo.findById.mockResolvedValue(customer);

    const useCase = new UpdateCustomerUseCase(repo);

    const result = await useCase.execute({
      id: 'customer-id-1',
      name: 'Jane Doe',
    });

    expect(result.name).toBe('Jane Doe');
    expect(repo.save).toHaveBeenCalledWith(customer);
  });

  it('should update customer email', async () => {
    const repo = makeCustomerRepository();
    repo.findById.mockResolvedValue(customer);

    const useCase = new UpdateCustomerUseCase(repo);

    const result = await useCase.execute({
      id: 'customer-id-1',
      email: 'jane.doe@email.com',
    });

    expect(result.email.value).toBe('jane.doe@email.com');
    expect(repo.save).toHaveBeenCalledWith(customer);
  });

  it('should throw error if customer does not exist', async () => {
    const repo = makeCustomerRepository();
    repo.findById.mockResolvedValue(null);

    const useCase = new UpdateCustomerUseCase(repo);

    await expect(
      useCase.execute({
        id: 'invalid-id',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Customer not found');

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw error for invalid name', async () => {
    const repo = makeCustomerRepository();
    repo.findById.mockResolvedValue(customer);

    const useCase = new UpdateCustomerUseCase(repo);

    await expect(
      useCase.execute({
        id: 'customer-id-1',
        name: 'J',
      }),
    ).rejects.toThrow('Invalid customer name');

    expect(repo.save).not.toHaveBeenCalled();
  });
});
