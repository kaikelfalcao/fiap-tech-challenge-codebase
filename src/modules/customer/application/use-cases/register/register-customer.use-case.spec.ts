// tests/customers/application/register-customer.use-case.spec.ts

import { VALID_CNPJ, VALID_CPF } from '../../helpers/customer.factory';
import type { CustomerRepositoryMock } from '../../helpers/repository.mock';
import { makeRepositoryMock } from '../../helpers/repository.mock';

import { RegisterCustomerUseCase } from './register-customer.use-case';

const makeInput = (overrides = {}) => ({
  taxId: VALID_CPF,
  fullName: 'John Doe',
  phone: '(71) 99999-0000',
  email: 'john@doe.com',
  ...overrides,
});

describe('RegisterCustomerUseCase', () => {
  let sut: RegisterCustomerUseCase;
  let repo: CustomerRepositoryMock;

  beforeEach(() => {
    repo = makeRepositoryMock();
    sut = new RegisterCustomerUseCase(repo);
  });

  it('should register a customer and return its id', async () => {
    repo.existsByTaxId.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    const output = await sut.execute(makeInput());

    expect(output.id).toBeDefined();
    expect(typeof output.id).toBe('string');
  });

  it('should call existsByTaxId before saving', async () => {
    repo.existsByTaxId.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    await sut.execute(makeInput());

    expect(repo.existsByTaxId).toHaveBeenCalledTimes(1);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should save a customer with the provided data', async () => {
    repo.existsByTaxId.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    await sut.execute(makeInput());

    const [saved] = repo.save.mock.calls[0];
    expect(saved.fullName).toBe('John Doe');
    expect(saved.phone).toBe('(71) 99999-0000');
    expect(saved.email.getValue()).toBe('john@doe.com');
  });

  it('should save the customer with active = true', async () => {
    repo.existsByTaxId.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    await sut.execute(makeInput());

    const [saved] = repo.save.mock.calls[0];
    expect(saved.active).toBe(true);
  });

  it('should accept a CNPJ as taxId', async () => {
    repo.existsByTaxId.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    const output = await sut.execute(makeInput({ taxId: VALID_CNPJ }));

    expect(output.id).toBeDefined();
    const [saved] = repo.save.mock.calls[0];
    expect(saved.taxId.type).toBe('CNPJ');
  });

  it('should throw if taxId is already registered', async () => {
    repo.existsByTaxId.mockResolvedValue(true);

    await expect(sut.execute(makeInput())).rejects.toThrow(
      'A customer with this tax ID already exists',
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw if taxId is invalid', async () => {
    await expect(
      sut.execute(makeInput({ taxId: '00000000000' })),
    ).rejects.toThrow();

    expect(repo.existsByTaxId).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should not call save when existsByTaxId throws', async () => {
    repo.existsByTaxId.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(repo.save).not.toHaveBeenCalled();
  });
});
