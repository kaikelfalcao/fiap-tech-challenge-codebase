// src/modules/inventory/infrastructure/stock.typeorm.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StockMapper } from '../mappers/stock.mapper';
import { StockMovementOrmEntity } from '../stock-movement.typeorm.entity';
import { StockOrmEntity } from '../stock.typeorm.entity';

import { StockMovement } from '@/modules/inventory/domain/stock-movement.entity';
import { Stock } from '@/modules/inventory/domain/stock.entity';
import { IStockRepository } from '@/modules/inventory/domain/stock.repository';
import { StockId } from '@/modules/inventory/domain/value-objects/stock-id.vo';

@Injectable()
export class StockTypeOrmRepository implements IStockRepository {
  constructor(
    @InjectRepository(StockOrmEntity)
    private readonly stockRepo: Repository<StockOrmEntity>,
    @InjectRepository(StockMovementOrmEntity)
    private readonly movementRepo: Repository<StockMovementOrmEntity>,
  ) {}

  async save(stock: Stock): Promise<void> {
    await this.stockRepo.insert(StockMapper.toOrm(stock));
  }

  async update(stock: Stock): Promise<void> {
    await this.stockRepo.save(StockMapper.toOrm(stock));
  }

  async findById(id: StockId): Promise<Stock | null> {
    const orm = await this.stockRepo.findOneBy({ id: id.value });
    return orm ? StockMapper.toDomain(orm) : null;
  }

  async findByItemId(itemId: string): Promise<Stock | null> {
    const orm = await this.stockRepo.findOneBy({ itemId });
    return orm ? StockMapper.toDomain(orm) : null;
  }

  async saveMovement(movement: StockMovement): Promise<void> {
    await this.movementRepo.insert(StockMapper.movementToOrm(movement));
  }

  async listMovements(stockId: string): Promise<StockMovement[]> {
    const rows = await this.movementRepo.find({
      where: { stockId },
      order: { createdAt: 'DESC' },
    });
    return rows.map(StockMapper.movementToDomain);
  }

  async deleteByItemId(itemId: string): Promise<void> {
    const stock = await this.stockRepo.findOneBy({ itemId });
    if (stock) {
      await this.movementRepo.delete({ stockId: stock.id });
      await this.stockRepo.delete({ itemId });
    }
  }
}
