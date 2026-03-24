import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Service } from '../../domain/service.entity';
import {
  IServiceRepository,
  ListServicesFilters,
  PaginatedResult,
} from '../../domain/service.repository';
import { ServiceCode } from '../../domain/value-objects/service-code.vo';
import { ServiceId } from '../../domain/value-objects/service-id.vo';

import { ServiceMapper } from './service.mapper';
import { ServiceOrmEntity } from './service.typeorm.entity';

@Injectable()
export class ServiceTypeOrmRepository implements IServiceRepository {
  constructor(
    @InjectRepository(ServiceOrmEntity)
    private readonly repo: Repository<ServiceOrmEntity>,
  ) {}

  async save(service: Service): Promise<void> {
    await this.repo.insert(ServiceMapper.toOrm(service));
  }

  async update(service: Service): Promise<void> {
    await this.repo.save(ServiceMapper.toOrm(service));
  }

  async delete(id: ServiceId): Promise<void> {
    await this.repo.delete({ id: id.value });
  }

  async findById(id: ServiceId): Promise<Service | null> {
    const orm = await this.repo.findOneBy({ id: id.value });
    return orm ? ServiceMapper.toDomain(orm) : null;
  }

  async findByCode(code: ServiceCode): Promise<Service | null> {
    const orm = await this.repo.findOneBy({ code: code.value });
    return orm ? ServiceMapper.toDomain(orm) : null;
  }

  async existsByCode(code: ServiceCode): Promise<boolean> {
    return this.repo.existsBy({ code: code.value });
  }

  async list(filters: ListServicesFilters): Promise<PaginatedResult<Service>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const qb = this.repo.createQueryBuilder('service');

    if (filters.active !== undefined) {
      qb.andWhere('service.active = :active', { active: filters.active });
    }

    const [rows, total] = await qb
      .orderBy('service.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: rows.map(ServiceMapper.toDomain), total, page, limit };
  }
}
