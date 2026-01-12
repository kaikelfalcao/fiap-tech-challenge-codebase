import { PartRepository } from 'src/application/ports/part.repository';

interface DeletePartInput {
  id: string;
}

export class DeletePartUseCase {
  constructor(private repo: PartRepository) {}

  async execute(input: DeletePartInput): Promise<void> {
    const part = await this.repo.findById(input.id);
    if (!part) throw new Error('Part not found');

    await this.repo.delete(input.id);
  }
}
