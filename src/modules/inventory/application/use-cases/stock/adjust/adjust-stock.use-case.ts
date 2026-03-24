import { Inject, Injectable } from '@nestjs/common';

import {
  type IStockRepository,
  STOCK_REPOSITORY,
} from '@/modules/inventory/domain/stock.repository';
import { StockMovementId } from '@/modules/inventory/domain/value-objects/stock-movement-id.vo';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface AdjustStockInput {
  itemId: string;
  newQuantity: number;
  note: string;
}

@Injectable()
export class AdjustStockUseCase {
  constructor(
    @Inject(STOCK_REPOSITORY) private readonly stocks: IStockRepository,
  ) {}

  async execute(input: AdjustStockInput): Promise<void> {
    const stock = await this.stocks.findByItemId(input.itemId);
    if (!stock) {
      throw new NotFoundException('Stock', input.itemId);
    }

    const movement = stock.adjust(
      input.newQuantity,
      StockMovementId.generate(),
      input.note,
    );

    await this.stocks.update(stock);
    await this.stocks.saveMovement(movement);
  }
}
