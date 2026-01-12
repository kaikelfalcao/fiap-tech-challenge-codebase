import { Inject, Injectable } from '@nestjs/common';
import type { PartRepository } from 'src/application/ports/part.repository';

interface DeletePartInput {
  id: string;
}

@Injectable()
export class DeletePartUseCase {
  constructor(@Inject('PartRepository') private repo: PartRepository) {}

  async execute(input: DeletePartInput): Promise<void> {
    const part = await this.repo.findById(input.id);
    if (!part) throw new Error('Part not found');

    await this.repo.delete(input.id);
  }
}
