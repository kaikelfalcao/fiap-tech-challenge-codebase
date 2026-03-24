import { Inject, Injectable } from '@nestjs/common';

import { Item } from '@/modules/inventory/domain/item.entity';
import {
  type IItemRepository,
  ITEM_REPOSITORY,
} from '@/modules/inventory/domain/item.repository';
import { Stock } from '@/modules/inventory/domain/stock.entity';
import {
  type IStockRepository,
  STOCK_REPOSITORY,
} from '@/modules/inventory/domain/stock.repository';
import { ItemCode } from '@/modules/inventory/domain/value-objects/item-code.vo';
import { ItemId } from '@/modules/inventory/domain/value-objects/item-id.vo';
import { ItemType } from '@/modules/inventory/domain/value-objects/item-type.vo';
import { StockId } from '@/modules/inventory/domain/value-objects/stock-id.vo';
import { ConflictException } from '@/shared/domain/exceptions/conflict.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';
import { Money } from '@/shared/domain/value-objects/money.vo';

export interface RegisterItemInput {
  code: string;
  name: string;
  type: ItemType;
  unit: string;
  unitPriceCents: number;
  minimumStock?: number;
}

export interface RegisterItemOutput {
  id: string;
  stockId: string;
}

@Injectable()
export class RegisterItemUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly items: IItemRepository,
    @Inject(STOCK_REPOSITORY) private readonly stocks: IStockRepository,
  ) {}

  async execute(input: RegisterItemInput): Promise<RegisterItemOutput> {
    let code: ItemCode;
    try {
      code = ItemCode.create(input.code);
    } catch (e) {
      throw new ValidationException((e as Error).message);
    }

    if (await this.items.existsByCode(code)) {
      throw new ConflictException(
        `An item with code ${code.value} already exists`,
      );
    }

    let unitPrice: Money;
    try {
      unitPrice = Money.fromCents(input.unitPriceCents);
    } catch (e) {
      throw new ValidationException((e as Error).message);
    }

    const item = Item.create({
      id: ItemId.generate(),
      code,
      name: input.name,
      type: input.type,
      unit: input.unit,
      unitPrice,
    });

    const stock = Stock.create({
      id: StockId.generate(),
      itemId: item.id().value,
      minimum: input.minimumStock ?? 0,
    });

    await this.items.save(item);
    await this.stocks.save(stock);

    return { id: item.id().value, stockId: stock.id().value };
  }
}
