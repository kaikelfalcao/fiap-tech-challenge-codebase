import { mock } from 'jest-mock-extended';

import type { IUserRepository } from '../../domain/user.repository';

export const makeUserRepositoryMock = () => mock<IUserRepository>();
export type UserRepositoryMock = ReturnType<typeof makeUserRepositoryMock>;
