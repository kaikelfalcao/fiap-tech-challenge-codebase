import { User } from '../../domain/user.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';

import { UserOrmEntity } from './user.typeorm.entity';

export class UserMapper {
  static toDomain(orm: UserOrmEntity): User {
    return User.restore({
      id: UserId.fromString(orm.id),
      taxId: orm.taxId,
      name: orm.name,
      passwordHash: orm.passwordHash,
      role: orm.role,
      active: orm.active,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(user: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = user.id().value;
    orm.taxId = user.taxId;
    orm.name = user.name;
    orm.passwordHash = user.passwordHash;
    orm.role = user.role;
    orm.active = user.active;
    orm.createdAt = user.createdAt;
    orm.updatedAt = user.updatedAt;
    return orm;
  }
}
