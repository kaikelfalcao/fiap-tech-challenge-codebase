import { Inject, Injectable } from '@nestjs/common';

import {
  type IItemRepository,
  ITEM_REPOSITORY,
} from '@/modules/inventory/domain/item.repository';
import {
  STOCK_REPOSITORY,
  type IStockRepository,
} from '@/modules/inventory/domain/stock.repository';
import { ItemId } from '@/modules/inventory/domain/value-objects/item-id.vo';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface DeleteItemInput {
  id: string;
}

@Injectable()
export class DeleteItemUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly items: IItemRepository,
    @Inject(STOCK_REPOSITORY) private readonly stocks: IStockRepository,
  ) {}

  async execute(input: DeleteItemInput): Promise<void> {
    const item = await this.items.findById(ItemId.fromString(input.id));
    if (!item) {
      throw new NotFoundException('Item', input.id);
    }
    item.ensureCanBeDeleted();
    await this.stocks.deleteByItemId(item.id().value);
    await this.items.delete(item.id() as ItemId);
  }
}
