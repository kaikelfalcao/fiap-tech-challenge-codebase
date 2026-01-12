import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceOrderOrm } from '../entities/service-order.orm';
import { ServiceOrder } from 'src/domain/entities/service-order.entity';
import { ServiceOrderRepository } from 'src/application/ports/service-order-repository';
import { ServiceOrderMapper } from '../mappers/service-order.mapper';

@Injectable()
export class TypeOrmServiceOrderRepository implements ServiceOrderRepository {
  constructor(
    @InjectRepository(ServiceOrderOrm)
    private repo: Repository<ServiceOrderOrm>,
  ) {}

  async save(order: ServiceOrder): Promise<void> {
    const orm = ServiceOrderMapper.toOrm(order);
    await this.repo.save(orm);
  }

  async update(order: ServiceOrder): Promise<void> {
    const orm = ServiceOrderMapper.toOrm(order);
    await this.repo.save(orm);
  }

  async findById(id: string): Promise<ServiceOrder | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: ['parts', 'repairs'],
    });
    return orm ? ServiceOrderMapper.toEntity(orm) : null;
  }

  async findAll(): Promise<ServiceOrder[]> {
    const orms = await this.repo.find({ relations: ['parts', 'repairs'] });
    return orms.map(ServiceOrderMapper.toEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
