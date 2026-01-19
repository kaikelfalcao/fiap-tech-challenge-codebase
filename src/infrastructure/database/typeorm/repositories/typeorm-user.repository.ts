import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '@domain/user/user.repository';
import { UserOrmEntity } from '../entities/user.orm';
import { User } from 'src/domain/entities/user.entity';

export class TypeormUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.repo.findOne({ where: { username } });
    if (!user) return null;

    return new User(user.id, user.username, user.passwordHash);
  }

  async save(user: User): Promise<void> {
    const ormUser = this.repo.create({
      id: user.id,
      username: user.username,
      passwordHash: user.passwordHash,
    });

    await this.repo.save(ormUser);
  }
}
