import { Inject, Injectable } from '@nestjs/common';

import {
  type IItemRepository,
  ITEM_REPOSITORY,
} from '@/modules/inventory/domain/item.repository';
import { MovementReason } from '@/modules/inventory/domain/stock-movement.entity';
import {
  type IStockRepository,
  STOCK_REPOSITORY,
} from '@/modules/inventory/domain/stock.repository';
import { ItemId } from '@/modules/inventory/domain/value-objects/item-id.vo';
import { StockMovementId } from '@/modules/inventory/domain/value-objects/stock-movement-id.vo';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { MetricsService } from '@/shared/infrastructure/metrics/metrics.service';

export interface AddStockInput {
  itemId: string;
  amount: number;
  reason: Extract<MovementReason, 'PURCHASE' | 'ADJUSTMENT'>;
  note?: string;
}

@Injectable()
export class AddStockUseCase {
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stocks: IStockRepository,
    @Inject(ITEM_REPOSITORY)
    private readonly items: IItemRepository,
    private readonly metrics: MetricsService,
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

    if (stock.isBelowMinimum) {
      const item = await this.items.findById(ItemId.fromString(input.itemId));
      if (item) {
        this.metrics.recordStockBelowMinimum(
          input.itemId,
          item.code.value,
          stock.available,
        );
      }
    }
  }
}
