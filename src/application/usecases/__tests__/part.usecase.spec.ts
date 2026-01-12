import { Part } from 'src/domain/entities/part.entity';
import { CreatePartUseCase } from '../part/create-part.usecase';
import { DeletePartUseCase } from '../part/delete-part.usecase';
import { UpdatePartUseCase } from '../part/update-part.usecase';
import { FindPartUseCase } from '../part/find-part.usecase';
import { FindAllPartsUseCase } from '../part/find-all-parts.usecase';
import { PartRepository } from 'src/application/ports/part.repository';

export const makePartRepository = (): jest.Mocked<PartRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findBySku: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('Part UseCases', () => {
  let repo: jest.Mocked<PartRepository>;

  beforeEach(() => {
    repo = makePartRepository();
  });

  describe('CreatePartUseCase', () => {
    it('should create a part', async () => {
      const useCase = new CreatePartUseCase(repo);
      const input = {
        name: 'Brake Pad',
        sku: 'BP-123',
        price: 50,
        quantity: 10,
      };

      repo.findBySku.mockResolvedValue(null);
      repo.save.mockResolvedValue();

      const part = await useCase.execute(input);

      expect(part).toBeInstanceOf(Part);
      expect(part.name).toBe(input.name);
      expect(repo.save).toHaveBeenCalledWith(part);
    });

    it('should throw if SKU exists', async () => {
      const useCase = new CreatePartUseCase(repo);
      const input = {
        name: 'Brake Pad',
        sku: 'BP-123',
        price: 50,
        quantity: 10,
      };

      repo.findBySku.mockResolvedValue({} as Part);

      await expect(useCase.execute(input)).rejects.toThrow(
        'Part SKU already exists',
      );
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('UpdatePartUseCase', () => {
    it('should update a part', async () => {
      const useCase = new UpdatePartUseCase(repo);
      const part = Part.create('Brake Pad', 'BP-123', 50, 10);
      repo.findById.mockResolvedValue(part);
      repo.update.mockResolvedValue();

      const result = await useCase.execute({ id: part.id, price: 60 });

      expect(result.price).toBe(60);
      expect(repo.update).toHaveBeenCalledWith(part);
    });

    it('should throw if part not found', async () => {
      const useCase = new UpdatePartUseCase(repo);
      repo.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({ id: 'invalid-id', price: 60 }),
      ).rejects.toThrow('Part not found');
    });
  });

  describe('DeletePartUseCase', () => {
    it('should delete a part', async () => {
      const useCase = new DeletePartUseCase(repo);
      const part = Part.create('Brake Pad', 'BP-123', 50);
      repo.findById.mockResolvedValue(part);
      repo.delete.mockResolvedValue();

      await useCase.execute({ id: part.id });

      expect(repo.delete).toHaveBeenCalledWith(part.id);
    });

    it('should throw if part not found', async () => {
      const useCase = new DeletePartUseCase(repo);
      repo.findById.mockResolvedValue(null);

      await expect(useCase.execute({ id: 'invalid-id' })).rejects.toThrow(
        'Part not found',
      );
    });
  });

  describe('FindPartUseCase', () => {
    it('should find by id', async () => {
      const useCase = new FindPartUseCase(repo);
      const part = Part.create('Brake Pad', 'BP-123', 50);
      repo.findById.mockResolvedValue(part);

      const result = await useCase.execute({ id: part.id });

      expect(result).toBe(part);
    });

    it('should throw if no identifier provided', async () => {
      const useCase = new FindPartUseCase(repo);

      await expect(useCase.execute({})).rejects.toThrow(
        'At least one identifier must be provided',
      );
    });
  });

  describe('FindAllPartsUseCase', () => {
    it('should return all parts', async () => {
      const useCase = new FindAllPartsUseCase(repo);
      const parts = [Part.create('Brake Pad', 'BP-123', 50)];
      repo.findAll.mockResolvedValue(parts);

      const result = await useCase.execute();

      expect(result).toBe(parts);
    });
  });
});
