import { Part } from 'src/domain/entities/part.entity';
import type { PartRepository } from 'src/application/ports/part.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllPartsUseCase {
  constructor(@Inject('PartRepository') private repo: PartRepository) {}

  async execute(): Promise<Part[]> {
    return this.repo.findAll();
  }
}
