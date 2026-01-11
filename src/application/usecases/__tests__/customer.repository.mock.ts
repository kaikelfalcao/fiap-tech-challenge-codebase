import { CustomerRepository } from 'src/application/ports/customer-repository';

export const makeCustomerRepository = (): jest.Mocked<CustomerRepository> => ({
  findByEmail: jest.fn(),
  findByRegistrationNumber: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  delete: jest.fn(),
});
