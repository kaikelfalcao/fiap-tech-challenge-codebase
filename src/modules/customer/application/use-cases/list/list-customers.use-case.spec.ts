import type { Customer } from '../../../domain/customer.entity';
import type { PaginatedResult } from '../../../domain/customer.repository';
import { TaxId } from '../../../domain/tax-id.vo';
import {
  makeCustomer,
  makeCustomerId,
  UUID_2,
  UUID_CNPJ,
  VALID_CNPJ,
} from '../../helpers/customer.factory';
import type { CustomerRepositoryMock } from '../../helpers/repository.mock';
import { makeRepositoryMock } from '../../helpers/repository.mock';

import { ListCustomersUseCase } from './list-customers.use-case';

const makePaginatedResult = (
  data: Customer[],
  overrides: Partial<PaginatedResult<Customer>> = {},
): PaginatedResult<Customer> => ({
  data,
  total: data.length,
  page: 1,
  limit: 20,
  ...overrides,
});

describe('ListCustomersUseCase', () => {
  let sut: ListCustomersUseCase;
  let repo: CustomerRepositoryMock;

  beforeEach(() => {
    repo = makeRepositoryMock();
    sut = new ListCustomersUseCase(repo);
  });

  it('should return a paginated list of customers', async () => {
    const customers = [
      makeCustomer(),
      makeCustomer({ id: makeCustomerId(UUID_2) }),
    ];
    repo.list.mockResolvedValue(makePaginatedResult(customers));

    const output = await sut.execute({});

    expect(output.data).toHaveLength(2);
    expect(output.total).toBe(2);
    expect(output.page).toBe(1);
    expect(output.limit).toBe(20);
  });

  it('should map each customer to the output shape', async () => {
    const customer = makeCustomer();
    repo.list.mockResolvedValue(makePaginatedResult([customer]));

    const output = await sut.execute({});
    const item = output.data[0];

    expect(item.id).toBe(customer.id().value);
    expect(item.fullName).toBe(customer.fullName);
    expect(item.phone).toBe(customer.phone);
    expect(item.email).toBe(customer.email.getValue());
    expect(item.active).toBe(customer.active);
    expect(item.createdAt).toBe(customer.createdAt);
    expect(item.updatedAt).toBe(customer.updatedAt);
  });

  it('should return formatted taxId in the output', async () => {
    const customer = makeCustomer();
    repo.list.mockResolvedValue(makePaginatedResult([customer]));

    const output = await sut.execute({});

    expect(output.data[0].taxId).toBe('529.982.247-25');
    expect(output.data[0].taxIdType).toBe('CPF');
  });

  it('should forward filters to the repository', async () => {
    repo.list.mockResolvedValue(makePaginatedResult([]));

    await sut.execute({ active: false, page: 2, limit: 10 });

    expect(repo.list).toHaveBeenCalledWith({
      active: false,
      page: 2,
      limit: 10,
    });
  });

  it('should return an empty list when no customers exist', async () => {
    repo.list.mockResolvedValue(makePaginatedResult([], { total: 0 }));

    const output = await sut.execute({});

    expect(output.data).toHaveLength(0);
    expect(output.total).toBe(0);
  });

  it('should preserve pagination metadata from repository', async () => {
    repo.list.mockResolvedValue(
      makePaginatedResult([makeCustomer()], { total: 100, page: 3, limit: 10 }),
    );

    const output = await sut.execute({ page: 3, limit: 10 });

    expect(output.total).toBe(100);
    expect(output.page).toBe(3);
    expect(output.limit).toBe(10);
  });

  it('should handle a mix of CPF and CNPJ customers', async () => {
    const cpfCustomer = makeCustomer();
    const cnpjCustomer = makeCustomer({
      id: makeCustomerId(UUID_CNPJ),
      taxId: TaxId.create(VALID_CNPJ),
    });
    repo.list.mockResolvedValue(
      makePaginatedResult([cpfCustomer, cnpjCustomer]),
    );

    const output = await sut.execute({});

    expect(output.data[0].taxIdType).toBe('CPF');
    expect(output.data[1].taxIdType).toBe('CNPJ');
  });

  it('should throw if repository throws', async () => {
    repo.list.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({})).rejects.toThrow('Database error');
  });
});
