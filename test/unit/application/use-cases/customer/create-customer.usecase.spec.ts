import { CreateCustomerUseCase } from '../../../../../src/application/use-cases/customer/create-customer.usecase';
import { ICustomerRepository } from '../../../../../src/domain/repositories/customer.repository';
import { Customer } from '../../../../../src/domain/entities/customer.entity';

describe('CreateCustomerUseCase', () => {
  let useCase: CreateCustomerUseCase;
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

    useCase = new CreateCustomerUseCase(repository);
  });

  it('should create a customer successfully', async () => {
    const customerData = {
      name: 'Kaike',
      email: 'kaike@test.com',
      document: '36801082060',
    };

    const customerEntity = Customer.create(customerData);
    repository.create.mockResolvedValue(customerEntity);

    const result = await useCase.execute(customerData);

    const calledArg = repository.create.mock.calls[0][0];

    expect(calledArg.toJSON()).toEqual(
      expect.objectContaining({
        name: customerData.name,
        email: customerData.email,
        document: customerData.document,
      }),
    );

    expect(result).toEqual(customerEntity);
  });

  it('should throw for invalid email', async () => {
    await expect(
      useCase.execute({
        name: 'Kaike',
        email: 'invalid',
        document: '36801082060',
      }),
    ).rejects.toThrow('Invalid email');
  });

  it('should throw for invalid document', async () => {
    await expect(
      useCase.execute({
        name: 'Kaike',
        email: 'kaike@test.com',
        document: '123',
      }),
    ).rejects.toThrow('Invalid document');
  });
});
