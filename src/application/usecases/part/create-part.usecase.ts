import { Part } from 'src/domain/entities/part.entity';
import type { PartRepository } from 'src/domain/repositories/part.repository';
import { Inject, Injectable } from '@nestjs/common';

interface CreatePartInput {
  name: string;
  sku: string;
  price: number;
  quantity?: number;
}

@Injectable()
export class CreatePartUseCase {
  constructor(@Inject('PartRepository') private repo: PartRepository) {}

  async execute(input: CreatePartInput): Promise<Part> {
    const existing = await this.repo.findBySku(input.sku);
    if (existing) throw new Error('Part SKU already exists');

    const part = Part.create(
      input.name,
      input.sku,
      input.price,
      input.quantity,
    );
    await this.repo.save(part);

    return part;
  }
}
