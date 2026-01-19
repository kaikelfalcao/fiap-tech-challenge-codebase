import { Part } from '@domain/part/part.entity';
import type { PartRepository } from '@domain/part/part.repository';
import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '@shared/errors/not-found.error';

interface UpdatePartInput {
  id: string;
  name?: string;
  sku?: string;
  price?: number;
  quantity?: number;
}

@Injectable()
export class UpdatePartUseCase {
  constructor(
    @Inject('PartRepository') private partRepository: PartRepository,
  ) {}

  async execute(input: UpdatePartInput): Promise<Part> {
    const part = await this.partRepository.findById(input.id);
    if (!part) throw new NotFoundError('Part');

    if (input.name) part.changeName(input.name);
    if (input.sku) part.changeSku(input.sku);
    if (input.price !== undefined) part.changePrice(input.price);
    if (input.quantity !== undefined) part.changeQuantity(input.quantity);

    await this.partRepository.update(part);
    return part;
  }
}
