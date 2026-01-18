import { Customer } from '@domain/customer/customer.entity';
import { NotFoundError } from '@shared/errors/not-found.error';
import { UpdateCustomerUseCase } from './update-customer.usecase';

describe('UpdateCustomerUseCase', () => {
  let mockRepo: any;
  let useCase: UpdateCustomerUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    useCase = new UpdateCustomerUseCase(mockRepo);
  });

  it('should throw NotFoundError when customer does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'customer-id', name: 'New Name' }),
    ).rejects.toThrow(NotFoundError);

    expect(mockRepo.findById).toHaveBeenCalledWith('customer-id');
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should update customer name', async () => {
    const customer = Customer.create(
      'Old Name',
      'old@example.com',
      '12345678909',
      '1',
    );

    mockRepo.findById.mockResolvedValue(customer);
    mockRepo.save.mockResolvedValue(undefined);

    const result = await useCase.execute({
      id: '1',
      name: 'New Name',
    });

    expect(result.name).toBe('New Name');
    expect(mockRepo.save).toHaveBeenCalledWith(customer);
  });

  it('should update customer email', async () => {
    const customer = Customer.create(
      'John Doe',
      'old@example.com',
      '12345678909',
      '1',
    );

    mockRepo.findById.mockResolvedValue(customer);

    const result = await useCase.execute({
      id: '1',
      email: 'new@example.com',
    });

    expect(result.email.value).toBe('new@example.com');
    expect(mockRepo.save).toHaveBeenCalledWith(customer);
  });

  it('should update customer registration number', async () => {
    const customer = Customer.create(
      'John Doe',
      'john@example.com',
      '12345678909',
      '1',
    );

    mockRepo.findById.mockResolvedValue(customer);

    const result = await useCase.execute({
      id: '1',
      registrationNumber: '98765432100',
    });

    expect(result.registrationNumber.value).toBe('98765432100');
    expect(mockRepo.save).toHaveBeenCalledWith(customer);
  });

  it('should update multiple fields at once', async () => {
    const customer = Customer.create(
      'Old Name',
      'old@example.com',
      '12345678909',
      '1',
    );

    mockRepo.findById.mockResolvedValue(customer);

    const result = await useCase.execute({
      id: '1',
      name: 'New Name',
      email: 'new@example.com',
      registrationNumber: '98765432100',
    });

    expect(result.name).toBe('New Name');
    expect(result.email.value).toBe('new@example.com');
    expect(result.registrationNumber.value).toBe('98765432100');
    expect(mockRepo.save).toHaveBeenCalledWith(customer);
  });
});
