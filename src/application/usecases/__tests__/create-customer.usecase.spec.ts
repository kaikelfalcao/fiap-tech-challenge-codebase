import { CustomerAlreadyExistsError } from 'src/domain/errors/customer-already-exists.error';
import { Customer } from 'src/domain/entities/customer.entity';
import { CreateCustomerUseCase } from '../create-customer.usecase';
import { makeCustomerRepository } from './customer.repository.mock';

describe('CreateCustomerUseCase', () => {
  const validInput = {
    name: 'John Doe',
    email: 'john.doe@email.com',
    registrationNumber: '52998224725',
  };

  it('should create and save a customer when data is valid', async () => {
    const repo = makeCustomerRepository();

    repo.findByEmail.mockResolvedValue(null);
    repo.findByRegistrationNumber.mockResolvedValue(null);

    const useCase = new CreateCustomerUseCase(repo);

    const customer = await useCase.execute(validInput);

    expect(customer).toBeInstanceOf(Customer);
    expect(repo.findByEmail).toHaveBeenCalledWith(validInput.email);
    expect(repo.findByRegistrationNumber).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.save).toHaveBeenCalledWith(customer);
  });

  it('should throw error if customer already exists by email', async () => {
    const repo = makeCustomerRepository();

    repo.findByEmail.mockResolvedValue({} as Customer);
    repo.findByRegistrationNumber.mockResolvedValue(null);

    const useCase = new CreateCustomerUseCase(repo);

    await expect(useCase.execute(validInput)).rejects.toBeInstanceOf(
      CustomerAlreadyExistsError,
    );

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw error if customer already exists by registration number', async () => {
    const repo = makeCustomerRepository();

    repo.findByEmail.mockResolvedValue(null);
    repo.findByRegistrationNumber.mockResolvedValue({} as Customer);

    const useCase = new CreateCustomerUseCase(repo);

    await expect(useCase.execute(validInput)).rejects.toBeInstanceOf(
      CustomerAlreadyExistsError,
    );

    expect(repo.save).not.toHaveBeenCalled();
  });
});
