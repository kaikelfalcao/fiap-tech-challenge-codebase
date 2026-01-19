import { Part } from '@domain/part/part.entity';
import type { PartRepository } from '@domain/part/part.repository';
import { Inject, Injectable } from '@nestjs/common';
import { InvalidInputError } from '@shared/errors/invalid-input.error';

interface FindPartInput {
  id?: string;
  sku?: string;
}

@Injectable()
export class FindPartUseCase {
  constructor(
    @Inject('PartRepository') private partRepository: PartRepository,
  ) {}

  async execute(input: FindPartInput): Promise<Part | null> {
    if (input.id) return this.partRepository.findById(input.id);
    if (input.sku) return this.partRepository.findBySku(input.sku);

    throw new InvalidInputError('At least one identifier must be provided');
  }
}
