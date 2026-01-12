import { Part } from 'src/domain/entities/part.entity';
import { PartRepository } from 'src/application/ports/part.repository';

interface CreatePartInput {
  name: string;
  sku: string;
  price: number;
  quantity?: number;
}

export class CreatePartUseCase {
  constructor(private repo: PartRepository) {}

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
