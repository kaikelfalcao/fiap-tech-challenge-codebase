import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LicensePlate } from '../../domain/value-objects/license-plate.vo';
import { VehicleId } from '../../domain/value-objects/vehicle-id.vo';
import { Vehicle } from '../../domain/vehicle.entity';
import {
  IVehicleRepository,
  ListVehiclesFilters,
  PaginatedResult,
} from '../../domain/vehicle.repository';

import { VehicleMapper } from './ehicle.mapper';
import { VehicleOrmEntity } from './vehicle.typeorm.entity';

@Injectable()
export class VehicleTypeOrmRepository implements IVehicleRepository {
  constructor(
    @InjectRepository(VehicleOrmEntity)
    private readonly repo: Repository<VehicleOrmEntity>,
  ) {}

  async save(vehicle: Vehicle): Promise<void> {
    await this.repo.insert(VehicleMapper.toOrm(vehicle));
  }

  async update(vehicle: Vehicle): Promise<void> {
    await this.repo.save(VehicleMapper.toOrm(vehicle));
  }

  async delete(id: VehicleId): Promise<void> {
    await this.repo.delete({ id: id.value });
  }

  async findById(id: VehicleId): Promise<Vehicle | null> {
    const orm = await this.repo.findOneBy({ id: id.value });
    return orm ? VehicleMapper.toDomain(orm) : null;
  }

  async findByLicensePlate(plate: LicensePlate): Promise<Vehicle | null> {
    const orm = await this.repo.findOneBy({ licensePlate: plate.raw });
    return orm ? VehicleMapper.toDomain(orm) : null;
  }

  async existsByLicensePlate(plate: LicensePlate): Promise<boolean> {
    return this.repo.existsBy({ licensePlate: plate.raw });
  }

  async list(filters: ListVehiclesFilters): Promise<PaginatedResult<Vehicle>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const qb = this.repo.createQueryBuilder('vehicle');

    if (filters.customerId) {
      qb.andWhere('vehicle.customerId = :customerId', {
        customerId: filters.customerId,
      });
    }

    const [rows, total] = await qb
      .orderBy('vehicle.brand', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: rows.map(VehicleMapper.toDomain),
      total,
      page,
      limit,
    };
  }
}
