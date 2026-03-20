import { Inject, Injectable } from '@nestjs/common';

import {
  type IItemRepository,
  ITEM_REPOSITORY,
  PaginatedResult,
} from '@/modules/inventory/domain/item.repository';
import {
  type IStockRepository,
  STOCK_REPOSITORY,
} from '@/modules/inventory/domain/stock.repository';
import { ItemType } from '@/modules/inventory/domain/value-objects/item-type.vo';

export interface ListItemsInput {
  type?: ItemType;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface ListItemOutput {
  id: string;
  code: string;
  name: string;
  type: ItemType;
  unit: string;
  unitPriceCents: number;
  unitPriceFormatted: string;
  active: boolean;
  stock: {
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
export class ListItemsUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly items: IItemRepository,
    @Inject(STOCK_REPOSITORY) private readonly stocks: IStockRepository,
  ) {}

  async execute(
    input: ListItemsInput,
  ): Promise<PaginatedResult<ListItemOutput>> {
    const result = await this.items.list(input);

    const data = await Promise.all(
      result.data.map(async (item) => {
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
      }),
    );

    return { ...result, data };
  }
}
