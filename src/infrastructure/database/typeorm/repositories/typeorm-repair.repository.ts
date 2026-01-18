import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repair } from '@domain/repair/repair.entity';
import { RepairOrm } from '../entities/repair.orm';
import { RepairMapper } from '../mappers/repair.mapper';
import type { RepairRepository } from '@domain/repair/repair.repository';

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

  async findAll(options?: { skip?: number; take?: number }) {
    const repairs = await this.repo.find({
      skip: options?.skip,
      take: options?.take,
      order: { createdAt: 'DESC' },
    });

    return repairs.map(RepairMapper.toEntity);
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async update(repair: Repair): Promise<void> {
    await this.repo.save(RepairMapper.toOrm(repair));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
