import { User } from '../../domain/user.entity';
import type { UserProps } from '../../domain/user.entity';
import type { Role } from '../../domain/value-objects/role.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';

export const USER_UUID_1 = 'f1f2f3f4-0001-4000-8000-000000000001';
export const USER_UUID_2 = 'f1f2f3f4-0002-4000-8000-000000000002';
export const VALID_CPF = '52998224725';
export const VALID_CNPJ = '11222333000181';

export const makeUserId = (value = USER_UUID_1): UserId =>
  UserId.fromString(value);

export const makeRestoreProps = (
  overrides: Partial<UserProps> = {},
): UserProps => ({
  id: makeUserId(),
  taxId: VALID_CPF,
  name: 'John Admin',
  passwordHash: '$2b$10$hashedpasswordmock000000000000000000000000000000000000',
  role: 'ADMIN' as Role,
  active: true,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

export const makeUser = (overrides: Partial<UserProps> = {}): User =>
  User.restore(makeRestoreProps(overrides));
