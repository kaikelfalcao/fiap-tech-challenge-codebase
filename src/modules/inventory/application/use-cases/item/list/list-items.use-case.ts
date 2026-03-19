import { Inject, Injectable } from '@nestjs/common';

import { GetItemOutput } from '../get/get-item.use-case';

import { PaginatedResult } from '@/modules/customer/domain/customer.repository';
import {
  type IItemRepository,
  ITEM_REPOSITORY,
} from '@/modules/inventory/domain/item.repository';
import { ItemType } from '@/modules/inventory/domain/value-objects/item-type.vo';

export interface ListItemsInput {
  type?: ItemType;
  active?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class ListItemsUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly items: IItemRepository,
  ) {}

  async execute(
    input: ListItemsInput,
  ): Promise<PaginatedResult<Omit<GetItemOutput, 'stock'>>> {
    const result = await this.items.list(input);
    return {
      ...result,
      data: result.data.map((item) => ({
        id: item.id().value,
        code: item.code.value,
        name: item.name,
        type: item.type,
        unit: item.unit,
        unitPriceCents: item.unitPrice.cents,
        unitPriceFormatted: item.unitPrice.formatted,
        active: item.active,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    };
  }
}
