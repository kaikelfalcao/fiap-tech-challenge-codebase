import { Inject, Injectable } from '@nestjs/common';

import {
  type IItemRepository,
  ITEM_REPOSITORY,
} from '@/modules/inventory/domain/item.repository';
import { ItemId } from '@/modules/inventory/domain/value-objects/item-id.vo';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface DeactivateItemInput {
  id: string;
}

@Injectable()
export class DeactivateItemUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly items: IItemRepository,
  ) {}

  async execute(input: DeactivateItemInput): Promise<void> {
    const item = await this.items.findById(ItemId.fromString(input.id));
    if (!item) {
      throw new NotFoundException('Item', input.id);
    }
    item.deactivate();
    await this.items.update(item);
  }
}
