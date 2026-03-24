import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CustomerId } from '../../domain/customer-id.vo';
import { Customer } from '../../domain/customer.entity';
import {
  ICustomerRepository,
  ListCustomersFilters,
  PaginatedResult,
} from '../../domain/customer.repository';
import { TaxId } from '../../domain/tax-id.vo';

import { CustomerMapper } from './customer.mapper';
import { CustomerOrmEntity } from './customer.typeorm.entity';

@Injectable()
export class CustomerTypeOrmRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly repo: Repository<CustomerOrmEntity>,
  ) {}

  async save(customer: Customer): Promise<void> {
    const orm = CustomerMapper.toOrm(customer);
    await this.repo.insert(orm);
  }

  async update(customer: Customer): Promise<void> {
    const orm = CustomerMapper.toOrm(customer);
    await this.repo.save(orm);
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    const orm = await this.repo.findOneBy({ id: id.value });
    return orm ? CustomerMapper.toDomain(orm) : null;
  }

  async findByTaxId(taxId: TaxId): Promise<Customer | null> {
    const orm = await this.repo.findOneBy({ taxId: taxId.raw });
    return orm ? CustomerMapper.toDomain(orm) : null;
  }

  async existsByTaxId(taxId: TaxId): Promise<boolean> {
    return this.repo.existsBy({ taxId: taxId.raw });
  }

  async list(
    filters: ListCustomersFilters,
  ): Promise<PaginatedResult<Customer>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const qb = this.repo.createQueryBuilder('customer');

    if (filters.active !== undefined) {
      qb.andWhere('customer.active = :active', { active: filters.active });
    }

    const [rows, total] = await qb
      .orderBy('customer.fullName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: rows.map(CustomerMapper.toDomain),
      total,
      page,
      limit,
    };
  }

  async delete(id: CustomerId): Promise<void> {
    await this.repo.delete({ id: id.value });
  }
}
