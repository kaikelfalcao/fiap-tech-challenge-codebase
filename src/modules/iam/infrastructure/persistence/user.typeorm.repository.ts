import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../domain/user.entity';
import { type IUserRepository } from '../../domain/user.repository';
import { UserId } from '../../domain/value-objects/user-id.vo';

import { UserMapper } from './user.mapper';
import { UserOrmEntity } from './user.typeorm.entity';

@Injectable()
export class UserTypeOrmRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<void> {
    await this.repo.insert(UserMapper.toOrm(user));
  }

  async update(user: User): Promise<void> {
    await this.repo.save(UserMapper.toOrm(user));
  }

  async findById(id: UserId): Promise<User | null> {
    const orm = await this.repo.findOneBy({ id: id.value });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async findByTaxId(taxId: string): Promise<User | null> {
    const orm = await this.repo.findOneBy({ taxId });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async existsByTaxId(taxId: string): Promise<boolean> {
    return this.repo.existsBy({ taxId });
  }
}
