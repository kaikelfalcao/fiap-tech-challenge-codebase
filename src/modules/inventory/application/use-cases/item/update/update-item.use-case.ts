import { Inject, Injectable } from '@nestjs/common';

import {
  type IItemRepository,
  ITEM_REPOSITORY,
} from '@/modules/inventory/domain/item.repository';
import { ItemId } from '@/modules/inventory/domain/value-objects/item-id.vo';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';
import { Money } from '@/shared/domain/value-objects/money.vo';

export interface UpdateItemInput {
  id: string;
  name?: string;
  unit?: string;
  unitPriceCents?: number;
}

@Injectable()
export class UpdateItemUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly items: IItemRepository,
  ) {}

  async execute(input: UpdateItemInput): Promise<void> {
    const item = await this.items.findById(ItemId.fromString(input.id));
    if (!item) {
      throw new NotFoundException('Item', input.id);
    }

    let unitPrice: Money | undefined;
    if (input.unitPriceCents !== undefined) {
      try {
        unitPrice = Money.fromCents(input.unitPriceCents);
      } catch (e) {
        throw new ValidationException((e as Error).message);
      }
    }

    item.changeAttributes({ name: input.name, unit: input.unit, unitPrice });
    await this.items.update(item);
  }
}
