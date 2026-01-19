import { Inject, Injectable } from '@nestjs/common';
import { InvalidInputError } from '@shared/errors/invalid-input.error';
import type { PartRepository } from '@domain/part/part.repository';

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
export class ReturnPartUseCase {
  constructor(
    @Inject('PartRepository') private readonly partRepository: PartRepository,
  ) {}

  async execute(parts: ReturnPartInput[]): Promise<ReturnPartOutput> {
    const processed: ReturnPartOutput['processed'] = [];
    let totalValue = 0;

    for (const item of parts) {
      const part = await this.partRepository.findById(item.partId);
      if (!part) {
        throw new InvalidInputError(`Peça ${item.partId} não encontrada`);
      }

      part.changeQuantity(part.quantity + item.quantity);

      await this.partRepository.update(part);

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
