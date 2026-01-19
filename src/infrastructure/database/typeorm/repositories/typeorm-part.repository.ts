import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Part } from '@domain/part/part.entity';
import { PartOrm } from '../entities/part.orm';
import { PartMapper } from '../mappers/part.mapper';
import { PartRepository } from '@domain/part/part.repository';

@Injectable()
export class TypeOrmPartRepository implements PartRepository {
  constructor(
    @InjectRepository(PartOrm)
    private readonly repo: Repository<PartOrm>,
  ) {}

  async save(part: Part): Promise<void> {
    await this.repo.save(PartMapper.toOrm(part));
  }

  async findById(id: string): Promise<Part | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? PartMapper.toEntity(orm) : null;
  }

  async findBySku(sku: string): Promise<Part | null> {
    const orm = await this.repo.findOne({ where: { sku } });
    return orm ? PartMapper.toEntity(orm) : null;
  }

  async findAll(options?: { skip?: number; take?: number }): Promise<Part[]> {
    const parts = await this.repo.find({
      skip: options?.skip,
      take: options?.take,
      order: { createdAt: 'DESC' },
    });
    return parts.map(PartMapper.toEntity);
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async update(part: Part): Promise<void> {
    await this.repo.save(PartMapper.toOrm(part));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
