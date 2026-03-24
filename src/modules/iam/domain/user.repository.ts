import type { User } from './user.entity';
import type { UserId } from './value-objects/user-id.vo';

export interface IUserRepository {
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByTaxId(taxId: string): Promise<User | null>;
  existsByTaxId(taxId: string): Promise<boolean>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
