import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '@shared/errors/not-found.error';
import type { PartRepository } from '@domain/part/part.repository';

interface DeletePartInput {
  id: string;
}

@Injectable()
export class DeletePartUseCase {
  constructor(
    @Inject('PartRepository') private partRepository: PartRepository,
  ) {}

  async execute(input: DeletePartInput): Promise<void> {
    const part = await this.partRepository.findById(input.id);
    if (!part) throw new NotFoundError('Part');

    await this.partRepository.delete(input.id);
  }
}
