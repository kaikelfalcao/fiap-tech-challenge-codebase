import { Customer } from 'src/domain/entities/customer.entity';
import { CustomerAlreadyExistsError } from 'src/domain/errors/customer-already-exists.error';
import { CustomerRepository } from 'src/domain/repositories/customer.repository';
import { CreateCustomerUseCase } from '../customer/create-customer.usecase';
import { UpdateCustomerUseCase } from '../customer/update-customer.usecase';
import { FindCustomerUseCase } from '../customer/find-customer.usecase';
import { DeleteCustomerUseCase } from '../customer/delete-customer.usecase';

export const makeCustomerRepository = (): jest.Mocked<CustomerRepository> => ({
  findByEmail: jest.fn(),
  findByRegistrationNumber: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  delete: jest.fn(),
});

describe('Customer UseCases', () => {
  const validInput = {
    name: 'John Doe',
    email: 'john.doe@email.com',
    registrationNumber: '52998224725',
  };

  describe('CreateCustomerUseCase', () => {
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

      const useCase = new UpdateCustomerUseCase(
        repo,
        new FindCustomerUseCase(repo),
      );
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

      const useCase = new UpdateCustomerUseCase(
        repo,
        new FindCustomerUseCase(repo),
      );
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

      const useCase = new UpdateCustomerUseCase(
        repo,
        new FindCustomerUseCase(repo),
      );
      await expect(
        useCase.execute({ id: 'invalid-id', name: 'Jane Doe' }),
      ).rejects.toThrow('Customer not found');

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid name', async () => {
      const repo = makeCustomerRepository();
      repo.findById.mockResolvedValue(customer);

      const useCase = new UpdateCustomerUseCase(
        repo,
        new FindCustomerUseCase(repo),
      );
      await expect(
        useCase.execute({ id: 'customer-id-1', name: 'J' }),
      ).rejects.toThrow('Invalid customer name');

      expect(repo.save).not.toHaveBeenCalled();
    });
  });

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
      const result = await useCase.execute({ email: 'john.doe@email.com' });

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

    it('should throw error when no search criteria is provided', async () => {
      const repo = makeCustomerRepository();
      const useCase = new FindCustomerUseCase(repo);

      await expect(useCase.execute({})).rejects.toThrow(
        'At least one identifier must be provided',
      );
    });
  });

  describe('DeleteCustomerUseCase', () => {
    it('should delete customer when it exists', async () => {
      const repo = makeCustomerRepository();
      repo.findById.mockResolvedValue({ id: 'customer-id-1' } as Customer);

      const useCase = new DeleteCustomerUseCase(
        repo,
        new FindCustomerUseCase(repo),
      );
      await useCase.execute({ id: 'customer-id-1' });

      expect(repo.findById).toHaveBeenCalledWith('customer-id-1');
      expect(repo.delete).toHaveBeenCalledWith('customer-id-1');
    });

    it('should throw error when customer does not exist', async () => {
      const repo = makeCustomerRepository();
      repo.findById.mockResolvedValue(null);

      const useCase = new DeleteCustomerUseCase(
        repo,
        new FindCustomerUseCase(repo),
      );
      await expect(useCase.execute({ id: 'invalid-id' })).rejects.toThrow(
        'Customer not found',
      );

      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
