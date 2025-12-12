import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ICustomerRepository } from '../../../../domain/repositories/customer.repository';
import { CustomerTypeOrmEntity } from '../entities/customer.typeorm.entity';
import { Customer } from '../../../../domain/entities/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerOrmMapper } from '../mappers/customer.mapper';

@Injectable()
export class CustomerRepositoryImpl implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerTypeOrmEntity)
    private readonly repo: Repository<CustomerTypeOrmEntity>,
  ) {}
  async findByEmail(email: string) {
    const row = await this.repo.findOne({ where: { email } });
    return row ? CustomerOrmMapper.toDomain(row) : null;
  }

  async findByDocument(document: string) {
    const row = await this.repo.findOne({ where: { document } });
    return row ? CustomerOrmMapper.toDomain(row) : null;
  }

  async create(entity: Customer): Promise<Customer> {
    const orm = CustomerOrmMapper.toOrm(entity);
    const saved = await this.repo.save(orm);
    return CustomerOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Customer | null> {
    const found = await this.repo.findOne({ where: { id } });
    return found ? CustomerOrmMapper.toDomain(found) : null;
  }

  async update(entity: Customer): Promise<Customer> {
    const orm = CustomerOrmMapper.toOrm(entity);
    const saved = await this.repo.save(orm);
    return CustomerOrmMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findAll(): Promise<Customer[]> {
    const rows = await this.repo.find();
    return rows.map((row) => CustomerOrmMapper.toDomain(row));
  }
}
