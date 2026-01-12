import { Part } from 'src/domain/entities/part.entity';
import { PartRepository } from 'src/application/ports/part.repository';

interface FindPartInput {
  id?: string;
  sku?: string;
}

export class FindPartUseCase {
  constructor(private repo: PartRepository) {}

  async execute(input: FindPartInput): Promise<Part | null> {
    if (input.id) return this.repo.findById(input.id);
    if (input.sku) return this.repo.findBySku(input.sku);

    throw new Error('At least one identifier must be provided');
  }
}
