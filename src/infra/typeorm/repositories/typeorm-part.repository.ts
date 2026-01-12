import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartRepository } from 'src/application/ports/part.repository';
import { Part } from 'src/domain/entities/part.entity';
import { PartOrm } from '../entities/part.orm';
import { PartMapper } from '../mappers/part.mapper';

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

  async findAll(): Promise<Part[]> {
    const ormList = await this.repo.find();
    return ormList.map(PartMapper.toEntity);
  }

  async update(part: Part): Promise<void> {
    await this.repo.save(PartMapper.toOrm(part));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
