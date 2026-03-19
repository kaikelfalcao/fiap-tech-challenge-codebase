import { Inject, Injectable } from '@nestjs/common';

import {
  type IStockRepository,
  STOCK_REPOSITORY,
} from '@/modules/inventory/domain/stock.repository';
import { StockMovementId } from '@/modules/inventory/domain/value-objects/stock-movement-id.vo';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface ReleaseStockInput {
  itemId: string;
  amount: number;
  referenceId: string;
  note?: string;
}

@Injectable()
export class ReleaseStockUseCase {
  constructor(
    @Inject(STOCK_REPOSITORY) private readonly stocks: IStockRepository,
  ) {}

  async execute(input: ReleaseStockInput): Promise<void> {
    const stock = await this.stocks.findByItemId(input.itemId);
    if (!stock) {
      throw new NotFoundException('Stock', input.itemId);
    }

    const movement = stock.release(
      input.amount,
      StockMovementId.generate(),
      input.referenceId,
      input.note,
    );

    await this.stocks.update(stock);
    await this.stocks.saveMovement(movement);
  }
}
