import { Inject, Injectable } from '@nestjs/common';
import type { PartRepository } from 'src/domain/repositories/part.repository';

export interface ReturnPartInput {
  partId: string;
  quantity: number;
}

export interface ReturnPartOutput {
  processed: Array<{
    partId: string;
    quantity: number;
    priceAtTime: number;
  }>;
  totalValue: number;
}

@Injectable()
export class ReturnPartsUseCase {
  constructor(
    @Inject('PartRepository') private readonly repository: PartRepository,
  ) {}

  async execute(parts: ReturnPartInput[]): Promise<ReturnPartOutput> {
    const processed: ReturnPartOutput['processed'] = [];
    let totalValue = 0;

    for (const item of parts) {
      const part = await this.repository.findById(item.partId);
      if (!part) {
        throw new Error(`Peça ${item.partId} não encontrada`);
      }

      part.changeQuantity(part.quantity + item.quantity);

      await this.repository.update(part);

      processed.push({
        partId: part.id,
        quantity: item.quantity,
        priceAtTime: part.price,
      });

      totalValue += part.price * item.quantity;
    }

    return { processed, totalValue };
  }
}
