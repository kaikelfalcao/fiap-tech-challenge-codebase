import { Part } from 'src/domain/entities/part.entity';
import { PartRepository } from 'src/application/ports/part.repository';

interface UpdatePartInput {
  id: string;
  name?: string;
  sku?: string;
  price?: number;
  quantity?: number;
}

export class UpdatePartUseCase {
  constructor(private repo: PartRepository) {}

  async execute(input: UpdatePartInput): Promise<Part> {
    const part = await this.repo.findById(input.id);
    if (!part) throw new Error('Part not found');

    if (input.name) part.changeName(input.name);
    if (input.sku) part.changeSku(input.sku);
    if (input.price !== undefined) part.changePrice(input.price);
    if (input.quantity !== undefined) part.changeQuantity(input.quantity);

    await this.repo.update(part);
    return part;
  }
}
