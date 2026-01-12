import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repair } from 'src/domain/entities/repair.entity';
import { RepairOrm } from '../entities/repair.orm';
import { RepairMapper } from '../mappers/repair.mapper';
import type { RepairRepository } from 'src/domain/repositories/repair.repository';

@Injectable()
export class TypeOrmRepairRepository implements RepairRepository {
  constructor(
    @InjectRepository(RepairOrm)
    private readonly repo: Repository<RepairOrm>,
  ) {}

  async save(repair: Repair): Promise<void> {
    await this.repo.save(RepairMapper.toOrm(repair));
  }

  async findById(id: string): Promise<Repair | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? RepairMapper.toEntity(orm) : null;
  }

  async findAll(): Promise<Repair[]> {
    const ormList = await this.repo.find();
    return ormList.map(RepairMapper.toEntity);
  }

  async update(repair: Repair): Promise<void> {
    await this.repo.save(RepairMapper.toOrm(repair));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
