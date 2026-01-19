import { Part } from '@domain/part/part.entity';
import type { PartRepository } from '@domain/part/part.repository';
import { Inject, Injectable } from '@nestjs/common';
import { InvalidInputError } from '@shared/errors/invalid-input.error';

interface CreatePartInput {
  name: string;
  sku: string;
  price: number;
  quantity?: number;
}

@Injectable()
export class CreatePartUseCase {
  constructor(
    @Inject('PartRepository') private partRepository: PartRepository,
  ) {}

  async execute(input: CreatePartInput): Promise<Part> {
    const existing = await this.partRepository.findBySku(input.sku);
    if (existing) throw new InvalidInputError('Part SKU already exists');

    const part = Part.create(
      input.name,
      input.sku,
      input.price,
      input.quantity,
    );
    await this.partRepository.save(part);

    return part;
  }
}
