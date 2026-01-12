import { Part } from 'src/domain/entities/part.entity';
import type { PartRepository } from 'src/domain/repositories/part.repository';
import { Inject, Injectable } from '@nestjs/common';

interface FindPartInput {
  id?: string;
  sku?: string;
}

@Injectable()
export class FindPartUseCase {
  constructor(@Inject('PartRepository') private repo: PartRepository) {}

  async execute(input: FindPartInput): Promise<Part | null> {
    if (input.id) return this.repo.findById(input.id);
    if (input.sku) return this.repo.findBySku(input.sku);

    throw new Error('At least one identifier must be provided');
  }
}
