import { Part } from 'src/domain/entities/part.entity';
import { PartRepository } from 'src/application/ports/part.repository';

export class FindAllPartsUseCase {
  constructor(private repo: PartRepository) {}

  async execute(): Promise<Part[]> {
    return this.repo.findAll();
  }
}
