import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ServiceOrder } from '../../domain/service-order.entity';
import {
  IServiceOrderRepository,
  ListServiceOrdersFilters,
  PaginatedResult,
} from '../../domain/service-order.repository';
import { ServiceOrderId } from '../../domain/value-objects/service-order-id.vo';

import { ServiceOrderMapper } from './service-order.mapper';
import { ServiceOrderOrmEntity } from './service-order.typeorm.entity';

@Injectable()
export class ServiceOrderTypeOrmRepository implements IServiceOrderRepository {
  constructor(
    @InjectRepository(ServiceOrderOrmEntity)
    private readonly repo: Repository<ServiceOrderOrmEntity>,
  ) {}

  async save(order: ServiceOrder): Promise<void> {
    await this.repo.insert(ServiceOrderMapper.toOrm(order));
  }

  async update(order: ServiceOrder): Promise<void> {
    await this.repo.save(ServiceOrderMapper.toOrm(order));
  }

  async findById(id: ServiceOrderId): Promise<ServiceOrder | null> {
    const orm = await this.repo.findOneBy({ id: id.value });
    return orm ? ServiceOrderMapper.toDomain(orm) : null;
  }

  async list(
    filters: ListServiceOrdersFilters,
  ): Promise<PaginatedResult<ServiceOrder>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const qb = this.repo.createQueryBuilder('so');

    if (filters.customerId) {
      qb.andWhere('so.customerId = :customerId', {
        customerId: filters.customerId,
      });
    }

    if (filters.vehicleId) {
      qb.andWhere('so.vehicleId = :vehicleId', {
        vehicleId: filters.vehicleId,
      });
    }

    if (filters.statuses?.length) {
      qb.andWhere('so.status IN (:...statuses)', {
        statuses: filters.statuses,
      });
    }

    if (filters.excludeStatuses?.length) {
      qb.andWhere('so.status NOT IN (:...excludeStatuses)', {
        excludeStatuses: filters.excludeStatuses,
      });
    }

    // Ordenação: prioridade de status definida no domínio, depois mais antigas primeiro
    qb.addSelect(
      `CASE so.status
        WHEN 'IN_EXECUTION' THEN 1
        WHEN 'AWAITING_APPROVAL' THEN 2
        WHEN 'DIAGNOSIS' THEN 3
        WHEN 'RECEIVED' THEN 4
        WHEN 'FINALIZED' THEN 5
        WHEN 'DELIVERED' THEN 6
       END`,
      'status_order',
    )
      .orderBy('status_order', 'ASC')
      .addOrderBy('so.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();

    return {
      data: rows.map(ServiceOrderMapper.toDomain),
      total,
      page,
      limit,
    };
  }
}
