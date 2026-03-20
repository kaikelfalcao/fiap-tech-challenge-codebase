import {
  makeUserRepositoryMock,
  type UserRepositoryMock,
} from '../../helpers/user-repository.mock';
import { VALID_CPF, VALID_CNPJ } from '../../helpers/user.factory';

import { RegisterUserUseCase } from './register-user.use-case';

import { ConflictException } from '@/shared/domain/exceptions/conflict.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

const makeInput = (overrides = {}) => ({
  taxId: VALID_CPF,
  name: 'John Admin',
  password: 'Secure@123',
  role: 'ADMIN' as const,
  ...overrides,
});

describe('RegisterUserUseCase', () => {
  let sut: RegisterUserUseCase;
  let repo: UserRepositoryMock;

  beforeEach(() => {
    repo = makeUserRepositoryMock();
    sut = new RegisterUserUseCase(repo);
  });

  it('should register a user and return its id', async () => {
    repo.existsByTaxId.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    const output = await sut.execute(makeInput());

    expect(output.id).toBeDefined();
    expect(typeof output.id).toBe('string');
  });

  it('should save user with active = true by default', async () => {
    repo.existsByTaxId.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    await sut.execute(makeInput());

    const [saved] = repo.save.mock.calls[0];
    expect(saved.active).toBe(true);
  });

  it('should save user with hashed password, not plain text', async () => {
    repo.existsByTaxId.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    await sut.execute(makeInput({ password: 'Secure@123' }));

    const [saved] = repo.save.mock.calls[0];
    expect(saved.passwordHash).not.toBe('Secure@123');
    expect(saved.passwordHash).toMatch(/^\$2b\$/);
  });

  it('should store the CPF without formatting', async () => {
    repo.existsByTaxId.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    await sut.execute(makeInput({ taxId: '529.982.247-25' }));

    const [saved] = repo.save.mock.calls[0];
    expect(saved.taxId).toBe(VALID_CPF);
    expect(saved.taxId).not.toContain('.');
  });

  it('should accept CNPJ as taxId', async () => {
    repo.existsByTaxId.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    await sut.execute(makeInput({ taxId: VALID_CNPJ, role: 'CUSTOMER' }));

    const [saved] = repo.save.mock.calls[0];
    expect(saved.taxId).toBe(VALID_CNPJ);
  });

  it('should throw ConflictException if taxId already exists', async () => {
    repo.existsByTaxId.mockResolvedValue(true);

    await expect(sut.execute(makeInput())).rejects.toThrow(ConflictException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if taxId is invalid', async () => {
    await expect(
      sut.execute(makeInput({ taxId: '00000000000' })),
    ).rejects.toThrow(ValidationException);

    expect(repo.existsByTaxId).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if password is shorter than 8 characters', async () => {
    repo.existsByTaxId.mockResolvedValue(false);

    await expect(
      sut.execute(makeInput({ password: '1234567' })),
    ).rejects.toThrow(ValidationException);
    await expect(
      sut.execute(makeInput({ password: '1234567' })),
    ).rejects.toThrow('at least 8 characters');

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should not call save when existsByTaxId throws', async () => {
    repo.existsByTaxId.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(repo.save).not.toHaveBeenCalled();
  });
});
