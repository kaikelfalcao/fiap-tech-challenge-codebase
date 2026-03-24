import {
  makeUserRepositoryMock,
  type UserRepositoryMock,
} from '../../helpers/user-repository.mock';
import { makeUser, USER_UUID_1, VALID_CPF } from '../../helpers/user.factory';

import { GetMeUseCase } from './get-me.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('GetMeUseCase', () => {
  let sut: GetMeUseCase;
  let repo: UserRepositoryMock;

  beforeEach(() => {
    repo = makeUserRepositoryMock();
    sut = new GetMeUseCase(repo);
  });

  it('should return the user output', async () => {
    const user = makeUser();
    repo.findById.mockResolvedValue(user);

    const output = await sut.execute({ userId: USER_UUID_1 });

    expect(output.id).toBe(user.id().value);
    expect(output.taxId).toBe(user.taxId);
    expect(output.name).toBe(user.name);
    expect(output.role).toBe(user.role);
    expect(output.active).toBe(user.active);
  });

  it('should not expose passwordHash in the output', async () => {
    repo.findById.mockResolvedValue(makeUser());

    const output = await sut.execute({ userId: USER_UUID_1 });

    expect(output).not.toHaveProperty('passwordHash');
  });

  it('should return taxId as raw (no formatting)', async () => {
    repo.findById.mockResolvedValue(makeUser({ taxId: VALID_CPF }));

    const output = await sut.execute({ userId: USER_UUID_1 });

    expect(output.taxId).toBe(VALID_CPF);
    expect(output.taxId).not.toContain('.');
    expect(output.taxId).not.toContain('-');
  });

  it('should call findById with the correct UserId', async () => {
    repo.findById.mockResolvedValue(makeUser());

    await sut.execute({ userId: USER_UUID_1 });

    const [calledId] = repo.findById.mock.calls[0];
    expect(calledId.value).toBe(USER_UUID_1);
  });

  it('should throw NotFoundException if user does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute({ userId: USER_UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
  });
});
