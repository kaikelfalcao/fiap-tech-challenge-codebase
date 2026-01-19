import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceOrderOrm } from '../entities/service-order.orm';
import { ServiceOrder } from '@domain/service-order/service-order.entity';
import { ServiceOrderRepository } from '@domain/service-order/service-order.repository';
import { ServiceOrderMapper } from '../mappers/service-order.mapper';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';

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
    const orms = await this.repo
      .createQueryBuilder('os')
      .leftJoinAndSelect('os.parts', 'parts')
      .leftJoinAndSelect('os.repairs', 'repairs')
      .where('os.status NOT IN (:...excluded)', {
        excluded: [
          ServiceOrderStatus.Finished,
          ServiceOrderStatus.Delivered,
          ServiceOrderStatus.Canceled,
        ],
      })
      .orderBy(
        `
      CASE os.status
        WHEN :inProgress THEN 1
        WHEN :awaitingApproval THEN 2
        WHEN :inDiagnosis THEN 3
        WHEN :received THEN 4
        ELSE 5
      END
      `,
      )
      .addOrderBy('os.createdAt', 'ASC')
      .setParameters({
        inProgress: ServiceOrderStatus.InProgress,
        awaitingApproval: ServiceOrderStatus.AwaitingApproval,
        inDiagnosis: ServiceOrderStatus.InDiagnosis,
        received: ServiceOrderStatus.Received,
      })
      .getMany();

    return orms.map(ServiceOrderMapper.toEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
