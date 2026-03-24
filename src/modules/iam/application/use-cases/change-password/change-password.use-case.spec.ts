import * as bcrypt from 'bcrypt';

import {
  makeUserRepositoryMock,
  type UserRepositoryMock,
} from '../../helpers/user-repository.mock';
import { makeUser, USER_UUID_1 } from '../../helpers/user.factory';

import { ChangePasswordUseCase } from './change-password.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

const makeInput = (overrides = {}) => ({
  userId: USER_UUID_1,
  currentPassword: 'OldPass@123',
  newPassword: 'NewPass@456',
  ...overrides,
});

describe('ChangePasswordUseCase', () => {
  let sut: ChangePasswordUseCase;
  let repo: UserRepositoryMock;

  beforeEach(() => {
    repo = makeUserRepositoryMock();
    sut = new ChangePasswordUseCase(repo);
  });

  it('should change password successfully', async () => {
    const hash = await bcrypt.hash('OldPass@123', 10);
    const user = makeUser({ passwordHash: hash });
    repo.findById.mockResolvedValue(user);
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    expect(repo.update).toHaveBeenCalledTimes(1);
    const [updated] = repo.update.mock.calls[0];
    expect(updated.passwordHash).not.toBe(hash);
    expect(updated.passwordHash).toMatch(/^\$2b\$/);
  });

  it('should not store the new password in plain text', async () => {
    const hash = await bcrypt.hash('OldPass@123', 10);
    repo.findById.mockResolvedValue(makeUser({ passwordHash: hash }));
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    const [updated] = repo.update.mock.calls[0];
    expect(updated.passwordHash).not.toBe('NewPass@456');
  });

  it('should throw NotFoundException if user does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if current password is wrong', async () => {
    const hash = await bcrypt.hash('OldPass@123', 10);
    repo.findById.mockResolvedValue(makeUser({ passwordHash: hash }));

    await expect(
      sut.execute(makeInput({ currentPassword: 'WrongOld@123' })),
    ).rejects.toThrow(ValidationException);
    await expect(
      sut.execute(makeInput({ currentPassword: 'WrongOld@123' })),
    ).rejects.toThrow('Current password is incorrect');

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if new password is shorter than 8 characters', async () => {
    const hash = await bcrypt.hash('OldPass@123', 10);
    repo.findById.mockResolvedValue(makeUser({ passwordHash: hash }));

    await expect(
      sut.execute(makeInput({ newPassword: '1234567' })),
    ).rejects.toThrow(ValidationException);
    await expect(
      sut.execute(makeInput({ newPassword: '1234567' })),
    ).rejects.toThrow('at least 8 characters');

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should call findById with the correct UserId', async () => {
    const hash = await bcrypt.hash('OldPass@123', 10);
    repo.findById.mockResolvedValue(makeUser({ passwordHash: hash }));
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    const [calledId] = repo.findById.mock.calls[0];
    expect(calledId.value).toBe(USER_UUID_1);
  });

  it('should not call update when findById throws', async () => {
    repo.findById.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(repo.update).not.toHaveBeenCalled();
  });
});
