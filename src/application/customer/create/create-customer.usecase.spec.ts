import { Customer } from '@domain/customer/customer.entity';
import { CustomerAlreadyExistsError } from '../errors/customerAlreadyExists.error';
import {
  CreateCustomerInput,
  CreateCustomerUseCase,
} from './create-customer.usecase';

describe('CreateCustomerUseCase', () => {
  let mockRepo: any;
  let useCase: CreateCustomerUseCase;

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
      findByRegistrationNumber: jest.fn(),
      save: jest.fn(),
    };

    useCase = new CreateCustomerUseCase(mockRepo);
  });

  it('should create a new customer successfully', async () => {
    const input: CreateCustomerInput = {
      name: 'John Doe',
      email: 'john@example.com',
      registrationNumber: '123.456.789-09',
    };

    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.findByRegistrationNumber.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue(undefined);

    const customer = await useCase.handle(input);

    expect(customer).toBeInstanceOf(Customer);
    expect(customer.name).toBe(input.name);
    expect(customer.email.value).toBe(input.email);
    expect(customer.registrationNumber.formatted).toBe(
      input.registrationNumber,
    );

    expect(mockRepo.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockRepo.findByRegistrationNumber).toHaveBeenCalledWith(
      customer.registrationNumber.value,
    );
    expect(mockRepo.save).toHaveBeenCalledWith(customer);
  });

  it('should throw CustomerAlreadyExistsError if email is already used', async () => {
    const input: CreateCustomerInput = {
      name: 'John Doe',
      email: 'john@example.com',
      registrationNumber: '123.456.789-09',
    };

    mockRepo.findByEmail.mockResolvedValue(
      Customer.create('Existing', input.email, '987.654.321-00', '1'),
    );

    await expect(useCase.handle(input)).rejects.toThrow(
      CustomerAlreadyExistsError,
    );
    expect(mockRepo.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockRepo.findByRegistrationNumber).not.toHaveBeenCalled();
  });

  it('should throw CustomerAlreadyExistsError if registrationNumber is already used', async () => {
    const input: CreateCustomerInput = {
      name: 'John Doe',
      email: 'john@example.com',
      registrationNumber: '12345678909',
    };

    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.findByRegistrationNumber.mockResolvedValue(
      Customer.create(
        'Existing',
        'other@example.com',
        input.registrationNumber,
        '2',
      ),
    );

    await expect(useCase.handle(input)).rejects.toThrow(
      CustomerAlreadyExistsError,
    );

    expect(mockRepo.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockRepo.findByRegistrationNumber).toHaveBeenCalledWith(
      input.registrationNumber,
    );
  });
});
