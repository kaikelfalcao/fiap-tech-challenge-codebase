import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { mock } from 'jest-mock-extended';

import {
  makeUserRepositoryMock,
  type UserRepositoryMock,
} from '../../helpers/user-repository.mock';
import { makeUser, VALID_CPF } from '../../helpers/user.factory';

import { LoginUseCase } from './login.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

const makeInput = (overrides = {}) => ({
  taxId: VALID_CPF,
  password: 'Secure@123',
  ...overrides,
});

describe('LoginUseCase', () => {
  let sut: LoginUseCase;
  let repo: UserRepositoryMock;
  let jwtService: ReturnType<typeof mock<JwtService>>;

  beforeEach(async () => {
    repo = makeUserRepositoryMock();
    jwtService = mock<JwtService>();
    sut = new LoginUseCase(repo, jwtService);
  });

  it('should return accessToken and user info on valid credentials', async () => {
    const hash = await bcrypt.hash('Secure@123', 10);
    const user = makeUser({ passwordHash: hash });
    repo.findByTaxId.mockResolvedValue(user);
    jwtService.sign.mockReturnValue('mock.jwt.token');

    const output = await sut.execute(makeInput());

    expect(output.accessToken).toBe('mock.jwt.token');
    expect(output.userId).toBe(user.id().value);
    expect(output.name).toBe(user.name);
    expect(output.role).toBe(user.role);
  });

  it('should call jwtService.sign with correct payload', async () => {
    const hash = await bcrypt.hash('Secure@123', 10);
    const user = makeUser({ passwordHash: hash });
    repo.findByTaxId.mockResolvedValue(user);
    jwtService.sign.mockReturnValue('mock.jwt.token');

    await sut.execute(makeInput());

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: user.id().value,
      taxId: user.taxId,
      name: user.name,
      role: user.role,
    });
  });

  it('should accept formatted CPF and normalize before lookup', async () => {
    const hash = await bcrypt.hash('Secure@123', 10);
    const user = makeUser({ passwordHash: hash });
    repo.findByTaxId.mockResolvedValue(user);
    jwtService.sign.mockReturnValue('token');

    await sut.execute(makeInput({ taxId: '529.982.247-25' }));

    expect(repo.findByTaxId).toHaveBeenCalledWith(VALID_CPF);
  });

  it('should throw ValidationException if password is wrong', async () => {
    const hash = await bcrypt.hash('CorrectPass@1', 10);
    const user = makeUser({ passwordHash: hash });
    repo.findByTaxId.mockResolvedValue(user);

    await expect(
      sut.execute(makeInput({ password: 'WrongPass@1' })),
    ).rejects.toThrow(ValidationException);
    await expect(
      sut.execute(makeInput({ password: 'WrongPass@1' })),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw ValidationException if user does not exist', async () => {
    repo.findByTaxId.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(ValidationException);
    await expect(sut.execute(makeInput())).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('should throw ValidationException if taxId is completely invalid format', async () => {
    await expect(
      sut.execute(makeInput({ taxId: 'not-a-document' })),
    ).rejects.toThrow(ValidationException);

    expect(repo.findByTaxId).not.toHaveBeenCalled();
  });

  it('should throw BusinessRuleException if user account is inactive', async () => {
    const hash = await bcrypt.hash('Secure@123', 10);
    const user = makeUser({ active: false, passwordHash: hash });
    repo.findByTaxId.mockResolvedValue(user);

    await expect(sut.execute(makeInput())).rejects.toThrow(
      BusinessRuleException,
    );
    await expect(sut.execute(makeInput())).rejects.toThrow('inactive');
  });

  it('should not expose whether taxId exists via error message', async () => {
    repo.findByTaxId.mockResolvedValue(null);

    const error1 = await sut.execute(makeInput()).catch((e) => e);

    const hash = await bcrypt.hash('Secure@123', 10);
    repo.findByTaxId.mockResolvedValue(makeUser({ passwordHash: hash }));
    const error2 = await sut
      .execute(makeInput({ password: 'WrongPass' }))
      .catch((e) => e);

    // Ambas as mensagens devem ser idênticas
    expect(error1.message).toBe(error2.message);
  });
});
