import { Customer } from 'src/domain/entities/customer.entity';
import { makeCustomerRepository } from './customer.repository.mock';
import { FindCustomerUseCase } from '../find-customer.usecase';

describe('FindCustomerUseCase', () => {
  const customer = {
    id: 'customer-id-1',
    name: 'John Doe',
    email: { value: 'john.doe@email.com' },
    registrationNumber: { value: '52998224725' },
  } as Customer;

  it('should find customer by id', async () => {
    const repo = makeCustomerRepository();
    repo.findById.mockResolvedValue(customer);

    const useCase = new FindCustomerUseCase(repo);

    const result = await useCase.execute({ id: 'customer-id-1' });

    expect(result).toBe(customer);
    expect(repo.findById).toHaveBeenCalledWith('customer-id-1');
    expect(repo.findByEmail).not.toHaveBeenCalled();
    expect(repo.findByRegistrationNumber).not.toHaveBeenCalled();
  });

  it('should find customer by email when id is not provided', async () => {
    const repo = makeCustomerRepository();
    repo.findById.mockResolvedValue(null);
    repo.findByEmail.mockResolvedValue(customer);

    const useCase = new FindCustomerUseCase(repo);

    const result = await useCase.execute({
      email: 'john.doe@email.com',
    });

    expect(result).toBe(customer);
    expect(repo.findByEmail).toHaveBeenCalledWith('john.doe@email.com');
  });

  it('should find customer by registration number when others fail', async () => {
    const repo = makeCustomerRepository();
    repo.findById.mockResolvedValue(null);
    repo.findByEmail.mockResolvedValue(null);
    repo.findByRegistrationNumber.mockResolvedValue(customer);

    const useCase = new FindCustomerUseCase(repo);

    const result = await useCase.execute({
      registrationNumber: '52998224725',
    });

    expect(result).toBe(customer);
    expect(repo.findByRegistrationNumber).toHaveBeenCalledWith('52998224725');
  });

  it('should return null when customer is not found', async () => {
    const repo = makeCustomerRepository();
    repo.findById.mockResolvedValue(null);
    repo.findByEmail.mockResolvedValue(null);
    repo.findByRegistrationNumber.mockResolvedValue(null);

    const useCase = new FindCustomerUseCase(repo);

    const result = await useCase.execute({
      email: 'not-found@email.com',
    });

    expect(result).toBeNull();
  });

  it('should throw error when no search criteria is provided', async () => {
    const repo = makeCustomerRepository();
    const useCase = new FindCustomerUseCase(repo);

    await expect(useCase.execute({})).rejects.toThrow(
      'At least one identifier must be provided',
    );
  });
});
