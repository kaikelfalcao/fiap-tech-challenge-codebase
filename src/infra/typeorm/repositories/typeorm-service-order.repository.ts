import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceOrderOrm } from '../entities/service-order.orm';
import { ServiceOrder } from 'src/domain/entities/service-order.entity';
import { ServiceOrderRepository } from 'src/domain/repositories/service-order.repository';
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

  async findById(id: string): Promise<ServiceOrder> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: ['parts', 'repairs'],
    });

    if (!orm) {
      throw new Error('Not Found Service Order');
    }
    return ServiceOrderMapper.toEntity(orm);
  }

  async findByCustomerAndVehicle(
    customerId: string,
    vehicleId: string,
  ): Promise<ServiceOrder> {
    const orm = await this.repo.findOne({
      where: { customerId: customerId, vehicleId: vehicleId },
      relations: ['parts', 'repairs'],
    });

    if (!orm) {
      throw new Error('Not Found Service Order');
    }
    return ServiceOrderMapper.toEntity(orm);
  }

  async findAll(): Promise<ServiceOrder[]> {
    const orms = await this.repo.find({ relations: ['parts', 'repairs'] });
    return orms.map(ServiceOrderMapper.toEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
