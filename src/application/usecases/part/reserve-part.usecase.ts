import { Inject, Injectable } from '@nestjs/common';
import type { PartRepository } from 'src/domain/repositories/part.repository';

export interface ReservePartInput {
  partId: string;
  quantity: number;
}

export interface ReservePartOutput {
  processed: Array<{
    partId: string;
    quantity: number;
    priceAtTime: number;
  }>;
  totalCost: number;
}

@Injectable()
export class ReservePartsUseCase {
  constructor(
    @Inject('PartRepository') private readonly repository: PartRepository,
  ) {}

  async execute(parts: ReservePartInput[]): Promise<ReservePartOutput> {
    const processed: ReservePartOutput['processed'] = [];
    let totalCost = 0;

    for (const item of parts) {
      const part = await this.repository.findById(item.partId);
      if (!part) {
        throw new Error(`Peça ${item.partId} não encontrada`);
      }
      if (part.quantity < item.quantity) {
        throw new Error(`Estoque insuficiente para peça ${part.name}`);
      }

      part.changeQuantity(part.quantity - item.quantity);

      await this.repository.update(part);

      processed.push({
        partId: part.id,
        quantity: item.quantity,
        priceAtTime: part.price,
      });

      totalCost += part.price * item.quantity;
    }

    return { processed, totalCost };
  }
}
