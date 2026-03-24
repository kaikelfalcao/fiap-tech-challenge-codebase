import { TaxId } from '../../../domain/tax-id.vo';
import {
  makeCustomer,
  UUID_1,
  VALID_CNPJ,
} from '../../helpers/customer.factory';
import type { CustomerRepositoryMock } from '../../helpers/repository.mock';
import { makeRepositoryMock } from '../../helpers/repository.mock';

import { GetCustomerUseCase } from './get-customer.use-case';

describe('GetCustomerUseCase', () => {
  let sut: GetCustomerUseCase;
  let repo: CustomerRepositoryMock;

  beforeEach(() => {
    repo = makeRepositoryMock();
    sut = new GetCustomerUseCase(repo);
  });

  it('should return the customer output', async () => {
    const customer = makeCustomer();
    repo.findById.mockResolvedValue(customer);

    const output = await sut.execute({ id: UUID_1 });

    expect(output.id).toBe(customer.id().value);
    expect(output.fullName).toBe(customer.fullName);
    expect(output.phone).toBe(customer.phone);
    expect(output.active).toBe(customer.active);
    expect(output.createdAt).toBe(customer.createdAt);
    expect(output.updatedAt).toBe(customer.updatedAt);
  });

  it('should return CPF formatted and typed', async () => {
    const customer = makeCustomer();
    repo.findById.mockResolvedValue(customer);

    const output = await sut.execute({ id: UUID_1 });

    expect(output.taxId).toBe('529.982.247-25');
    expect(output.taxIdType).toBe('CPF');
  });

  it('should return CNPJ formatted and typed', async () => {
    const customer = makeCustomer({ taxId: TaxId.create(VALID_CNPJ) });
    repo.findById.mockResolvedValue(customer);

    const output = await sut.execute({ id: UUID_1 });

    expect(output.taxId).toBe('11.222.333/0001-81');
    expect(output.taxIdType).toBe('CNPJ');
  });

  it('should return email as plain string', async () => {
    const customer = makeCustomer();
    repo.findById.mockResolvedValue(customer);

    const output = await sut.execute({ id: UUID_1 });

    expect(output.email).toBe('john@doe.com');
  });

  it('should return active = false for inactive customers', async () => {
    const customer = makeCustomer({ active: false });
    repo.findById.mockResolvedValue(customer);

    const output = await sut.execute({ id: UUID_1 });

    expect(output.active).toBe(false);
  });

  it('should call findById with the correct CustomerId', async () => {
    const customer = makeCustomer();
    repo.findById.mockResolvedValue(customer);

    await sut.execute({ id: UUID_1 });

    const [calledId] = repo.findById.mock.calls[0];
    expect(calledId.value).toBe(UUID_1);
  });

  it('should throw if customer is not found', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute({ id: UUID_1 })).rejects.toThrow(
      'Customer not found',
    );
  });
});
