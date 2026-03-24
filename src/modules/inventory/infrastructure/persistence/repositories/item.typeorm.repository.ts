import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Item } from '../../../domain/item.entity';
import {
  ListItemsFilters,
  PaginatedResult,
  type IItemRepository,
} from '../../../domain/item.repository';
import { ItemCode } from '../../../domain/value-objects/item-code.vo';
import { ItemId } from '../../../domain/value-objects/item-id.vo';
import { ItemOrmEntity } from '../item.typeorm.entity';
import { ItemMapper } from '../mappers/item.mapper';

@Injectable()
export class ItemTypeOrmRepository implements IItemRepository {
  constructor(
    @InjectRepository(ItemOrmEntity)
    private readonly repo: Repository<ItemOrmEntity>,
  ) {}

  async save(item: Item): Promise<void> {
    await this.repo.insert(ItemMapper.toOrm(item));
  }

  async update(item: Item): Promise<void> {
    await this.repo.save(ItemMapper.toOrm(item));
  }

  async delete(id: ItemId): Promise<void> {
    await this.repo.delete({ id: id.value });
  }

  async findById(id: ItemId): Promise<Item | null> {
    const orm = await this.repo.findOneBy({ id: id.value });
    return orm ? ItemMapper.toDomain(orm) : null;
  }

  async findByCode(code: ItemCode): Promise<Item | null> {
    const orm = await this.repo.findOneBy({ code: code.value });
    return orm ? ItemMapper.toDomain(orm) : null;
  }

  async existsByCode(code: ItemCode): Promise<boolean> {
    return this.repo.existsBy({ code: code.value });
  }

  async list(filters: ListItemsFilters): Promise<PaginatedResult<Item>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const qb = this.repo.createQueryBuilder('item');

    if (filters.type) {
      qb.andWhere('item.type = :type', { type: filters.type });
    }
    if (filters.active !== undefined) {
      qb.andWhere('item.active = :active', { active: filters.active });
    }

    const [rows, total] = await qb
      .orderBy('item.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: rows.map(ItemMapper.toDomain), total, page, limit };
  }
}
