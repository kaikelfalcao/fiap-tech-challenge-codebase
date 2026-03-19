import { Inject, Injectable } from '@nestjs/common';

import {
  type IItemRepository,
  ITEM_REPOSITORY,
} from '@/modules/inventory/domain/item.repository';
import {
  type IStockRepository,
  STOCK_REPOSITORY,
} from '@/modules/inventory/domain/stock.repository';
import { ItemId } from '@/modules/inventory/domain/value-objects/item-id.vo';
import { ItemType } from '@/modules/inventory/domain/value-objects/item-type.vo';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface GetItemOutput {
  id: string;
  code: string;
  name: string;
  type: ItemType;
  unit: string;
  unitPriceCents: number;
  unitPriceFormatted: string;
  active: boolean;
  stock: {
    id: string;
    quantity: number;
    reserved: number;
    available: number;
    minimum: number;
    isBelowMinimum: boolean;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetItemUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly items: IItemRepository,
    @Inject(STOCK_REPOSITORY) private readonly stocks: IStockRepository,
  ) {}

  async execute(input: { id: string }): Promise<GetItemOutput> {
    const item = await this.items.findById(ItemId.fromString(input.id));
    if (!item) {
      throw new NotFoundException('Item', input.id);
    }

    const stock = await this.stocks.findByItemId(item.id().value);

    return {
      id: item.id().value,
      code: item.code.value,
      name: item.name,
      type: item.type,
      unit: item.unit,
      unitPriceCents: item.unitPrice.cents,
      unitPriceFormatted: item.unitPrice.formatted,
      active: item.active,
      stock: stock
        ? {
            id: stock.id().value,
            quantity: stock.quantity,
            reserved: stock.reserved,
            available: stock.available,
            minimum: stock.minimum,
            isBelowMinimum: stock.isBelowMinimum,
          }
        : null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
