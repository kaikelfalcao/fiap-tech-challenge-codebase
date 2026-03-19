import { Inject, Injectable } from '@nestjs/common';

import { MovementReason } from '@/modules/inventory/domain/stock-movement.entity';
import {
  type IStockRepository,
  STOCK_REPOSITORY,
} from '@/modules/inventory/domain/stock.repository';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface StockMovementOutput {
  id: string;
  quantity: number;
  reason: MovementReason;
  referenceId?: string;
  note?: string;
  createdAt: Date;
}

@Injectable()
export class GetStockMovementsUseCase {
  constructor(
    @Inject(STOCK_REPOSITORY) private readonly stocks: IStockRepository,
  ) {}

  async execute(input: { itemId: string }): Promise<StockMovementOutput[]> {
    const stock = await this.stocks.findByItemId(input.itemId);
    if (!stock) {
      throw new NotFoundException('Stock', input.itemId);
    }

    const movements = await this.stocks.listMovements(stock.id().value);
    return movements.map((m) => ({
      id: m.id().value,
      quantity: m.quantity,
      reason: m.reason,
      referenceId: m.referenceId,
      note: m.note,
      createdAt: m.createdAt,
    }));
  }
}
