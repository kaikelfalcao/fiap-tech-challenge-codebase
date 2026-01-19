import { Inject, Injectable } from '@nestjs/common';
import { InvalidInputError } from '@shared/errors/invalid-input.error';
import type { PartRepository } from '@domain/part/part.repository';
import { InsufficientStockPort } from '../errors/insufficient-stock-part.error';

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
export class ReservePartUseCase {
  constructor(
    @Inject('PartRepository') private readonly partRepository: PartRepository,
  ) {}

  async execute(parts: ReservePartInput[]): Promise<ReservePartOutput> {
    const processed: ReservePartOutput['processed'] = [];
    let totalCost = 0;

    for (const item of parts) {
      const part = await this.partRepository.findById(item.partId);
      if (!part) {
        throw new InvalidInputError(`Peça ${item.partId} não encontrada`);
      }
      if (part.quantity < item.quantity) {
        throw new InsufficientStockPort(
          `Estoque insuficiente para peça ${part.name}`,
        );
      }

      part.changeQuantity(part.quantity - item.quantity);

      await this.partRepository.update(part);

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
