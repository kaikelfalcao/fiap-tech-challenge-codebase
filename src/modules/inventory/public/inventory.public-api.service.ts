import { Inject, Injectable } from '@nestjs/common';

import type { Item } from '../domain/item.entity';
import {
  ITEM_REPOSITORY,
  type IItemRepository,
} from '../domain/item.repository';
import {
  STOCK_REPOSITORY,
  type IStockRepository,
} from '../domain/stock.repository';
import { ItemCode } from '../domain/value-objects/item-code.vo';
import { ItemId } from '../domain/value-objects/item-id.vo';
import { StockMovementId } from '../domain/value-objects/stock-movement-id.vo';

import type {
  IInventoryPublicApi,
  ItemStockView,
} from './inventory.public-api';

@Injectable()
export class InventoryPublicApiService implements IInventoryPublicApi {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly items: IItemRepository,
    @Inject(STOCK_REPOSITORY) private readonly stocks: IStockRepository,
  ) {}

  async getItemById(id: string): Promise<ItemStockView | null> {
    try {
      const item = await this.items.findById(ItemId.fromString(id));
      if (!item) {
        return null;
      }
      return this.toView(item);
    } catch {
      return null;
    }
  }

  async getItemByCode(code: string): Promise<ItemStockView | null> {
    try {
      const itemCode = ItemCode.create(code);
      const item = await this.items.findByCode(itemCode);
      if (!item) {
        return null;
      }
      return this.toView(item);
    } catch {
      return null;
    }
  }

  async reserveStock(
    itemId: string,
    amount: number,
    referenceId: string,
  ): Promise<void> {
    const stock = await this.stocks.findByItemId(itemId);
    if (!stock) {
      return;
    }
    const movement = stock.reserve(
      amount,
      StockMovementId.generate(),
      referenceId,
    );
    await this.stocks.update(stock);
    await this.stocks.saveMovement(movement);
  }

  async releaseStock(
    itemId: string,
    amount: number,
    referenceId: string,
  ): Promise<void> {
    const stock = await this.stocks.findByItemId(itemId);
    if (!stock) {
      return;
    }
    const movement = stock.release(
      amount,
      StockMovementId.generate(),
      referenceId,
    );
    await this.stocks.update(stock);
    await this.stocks.saveMovement(movement);
  }

  async consumeStock(
    itemId: string,
    amount: number,
    referenceId: string,
  ): Promise<void> {
    const stock = await this.stocks.findByItemId(itemId);
    if (!stock) {
      return;
    }
    const movement = stock.consume(
      amount,
      StockMovementId.generate(),
      referenceId,
    );
    await this.stocks.update(stock);
    await this.stocks.saveMovement(movement);
  }

  private async toView(item: Item): Promise<ItemStockView> {
    const stock = await this.stocks.findByItemId(item.id().value);
    return {
      id: item.id().value,
      code: item.code.value,
      name: item.name,
      type: item.type,
      unit: item.unit,
      unitPriceCents: item.unitPrice.cents,
      stock: stock
        ? {
            quantity: stock.quantity,
            reserved: stock.reserved,
            available: stock.available,
          }
        : { quantity: 0, reserved: 0, available: 0 },
    };
  }
}
