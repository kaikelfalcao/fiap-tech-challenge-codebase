import { Inject, Injectable } from '@nestjs/common';

import { MovementReason } from '@/modules/inventory/domain/stock-movement.entity';
import {
  type IStockRepository,
  STOCK_REPOSITORY,
} from '@/modules/inventory/domain/stock.repository';
import { StockMovementId } from '@/modules/inventory/domain/value-objects/stock-movement-id.vo';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface AddStockInput {
  itemId: string;
  amount: number;
  reason: Extract<MovementReason, 'PURCHASE' | 'ADJUSTMENT'>;
  note?: string;
}

@Injectable()
export class AddStockUseCase {
  constructor(
    @Inject(STOCK_REPOSITORY) private readonly stocks: IStockRepository,
  ) {}

  async execute(input: AddStockInput): Promise<void> {
    const stock = await this.stocks.findByItemId(input.itemId);
    if (!stock) {
      throw new NotFoundException('Stock', input.itemId);
    }

    const movement = stock.addQuantity(
      input.amount,
      StockMovementId.generate(),
      input.reason,
      undefined,
      input.note,
    );

    await this.stocks.update(stock);
    await this.stocks.saveMovement(movement);
  }
}
