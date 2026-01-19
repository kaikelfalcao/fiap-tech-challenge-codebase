import { Customer } from '@domain/customer/customer.entity';
import { InvalidInputError } from '@shared/errors/invalid-input.error';
import { NotFoundError } from '@shared/errors/not-found.error';
import { FindCustomerUseCase } from './find-customer.usecase';

describe('FindCustomerUseCase', () => {
  let mockRepo: any;
  let useCase: FindCustomerUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByRegistrationNumber: jest.fn(),
    };

    useCase = new FindCustomerUseCase(mockRepo);
  });

  it('should throw InvalidInputError when no params are provided', async () => {
    await expect(useCase.execute({})).rejects.toThrow(InvalidInputError);

    expect(mockRepo.findById).not.toHaveBeenCalled();
    expect(mockRepo.findByEmail).not.toHaveBeenCalled();
    expect(mockRepo.findByRegistrationNumber).not.toHaveBeenCalled();
  });

  it('should find customer by id', async () => {
    const customer = Customer.create(
      'John Doe',
      'john@example.com',
      '12345678909',
      '1',
    );

    mockRepo.findById.mockResolvedValue(customer);

    const result = await useCase.execute({ id: '1' });

    expect(result).toBe(customer);
    expect(mockRepo.findById).toHaveBeenCalledWith('1');
    expect(mockRepo.findByEmail).not.toHaveBeenCalled();
    expect(mockRepo.findByRegistrationNumber).not.toHaveBeenCalled();
  });

  it('should find customer by email when id is not provided', async () => {
    const customer = Customer.create(
      'John Doe',
      'john@example.com',
      '12345678909',
      '1',
    );

    mockRepo.findById.mockResolvedValue(null);
    mockRepo.findByEmail.mockResolvedValue(customer);

    const result = await useCase.execute({ email: 'john@example.com' });

    expect(result).toBe(customer);
    expect(mockRepo.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(mockRepo.findById).not.toHaveBeenCalled();
    expect(mockRepo.findByRegistrationNumber).not.toHaveBeenCalled();
  });

  it('should find customer by registration number when id and email are not provided', async () => {
    const customer = Customer.create(
      'John Doe',
      'john@example.com',
      '12345678909',
      '1',
    );

    mockRepo.findById.mockResolvedValue(null);
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.findByRegistrationNumber.mockResolvedValue(customer);

    const result = await useCase.execute({
      registrationNumber: '12345678909',
    });

    expect(result).toBe(customer);
    expect(mockRepo.findByRegistrationNumber).toHaveBeenCalledWith(
      '12345678909',
    );
    expect(mockRepo.findById).not.toHaveBeenCalled();
    expect(mockRepo.findByEmail).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when customer is not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.findByRegistrationNumber.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existing-id' })).rejects.toThrow(
      NotFoundError,
    );

    expect(mockRepo.findById).toHaveBeenCalledWith('non-existing-id');
  });
});
