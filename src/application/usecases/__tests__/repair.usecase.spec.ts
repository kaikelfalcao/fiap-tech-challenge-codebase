import { Repair } from 'src/domain/entities/repair.entity';
import type { RepairRepository } from 'src/application/ports/repair.repository';
import { CreateRepairUseCase } from '../repair/create-repair.usecase';
import { UpdateRepairUseCase } from '../repair/update-repair.usecase';
import { DeleteRepairUseCase } from '../repair/delete-repair.usecase';
import { FindRepairUseCase } from '../repair/find-repair.usecase';
import { FindAllRepairsUseCase } from '../repair/find-all-repairs.usecase';

const makeRepairRepository = (): jest.Mocked<RepairRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
});

describe('Repair UseCases', () => {
  let repo: jest.Mocked<RepairRepository>;
  let createUseCase: CreateRepairUseCase;
  let updateUseCase: UpdateRepairUseCase;
  let deleteUseCase: DeleteRepairUseCase;
  let findUseCase: FindRepairUseCase;
  let findAllUseCase: FindAllRepairsUseCase;

  beforeEach(() => {
    repo = makeRepairRepository();
    createUseCase = new CreateRepairUseCase(repo);
    updateUseCase = new UpdateRepairUseCase(repo);
    deleteUseCase = new DeleteRepairUseCase(repo);
    findUseCase = new FindRepairUseCase(repo);
    findAllUseCase = new FindAllRepairsUseCase(repo);
  });

  describe('CreateRepairUseCase', () => {
    it('should create and save a repair', async () => {
      const input = { description: 'Replace brake pads', cost: 150.0 };
      repo.save.mockResolvedValue();

      const repair = await createUseCase.execute(input);

      expect(repair).toBeInstanceOf(Repair);
      expect(repair.description).toBe(input.description);
      expect(repair.cost).toBe(input.cost);
      expect(repo.save).toHaveBeenCalledWith(repair);
    });
  });

  describe('UpdateRepairUseCase', () => {
    it('should update repair cost', async () => {
      const repair = Repair.create('Replace brake pads', 150.0);
      repo.findById.mockResolvedValue(repair);
      repo.update.mockResolvedValue();

      const updated = await updateUseCase.execute({
        id: repair.id,
        cost: 200.0,
      });

      expect(updated.cost).toBe(200.0);
      expect(repo.update).toHaveBeenCalledWith(repair);
    });

    it('should throw error if repair not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        updateUseCase.execute({ id: 'nonexistent-id', cost: 200.0 }),
      ).rejects.toThrow('Repair not found');

      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('DeleteRepairUseCase', () => {
    it('should delete a repair by id', async () => {
      const repair = Repair.create('Replace brake pads', 150.0);
      repo.findById.mockResolvedValue(repair);
      repo.delete.mockResolvedValue();

      await deleteUseCase.execute({ id: repair.id });

      expect(repo.findById).toHaveBeenCalledWith(repair.id);
      expect(repo.delete).toHaveBeenCalledWith(repair.id);
    });

    it('should throw error if repair not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        deleteUseCase.execute({ id: 'nonexistent-id' }),
      ).rejects.toThrow('Repair not found');

      expect(repo.delete).not.toHaveBeenCalled();
    });
  });

  describe('FindRepairUseCase', () => {
    it('should find a repair by id', async () => {
      const repair = Repair.create('Replace brake pads', 150.0);
      repo.findById.mockResolvedValue(repair);

      const result = await findUseCase.execute({ id: repair.id });

      expect(result).toBe(repair);
      expect(repo.findById).toHaveBeenCalledWith(repair.id);
    });

    it('should return null if repair not found', async () => {
      repo.findById.mockResolvedValue(null);

      const result = await findUseCase.execute({ id: 'nonexistent-id' });

      expect(result).toBeNull();
    });
  });

  describe('FindAllRepairsUseCase', () => {
    it('should return all repairs', async () => {
      const repair1 = Repair.create('Replace brake pads', 150.0);
      const repair2 = Repair.create('Oil change', 50.0);
      repo.findAll.mockResolvedValue([repair1, repair2]);

      const result = await findAllUseCase.execute();

      expect(result).toHaveLength(2);
      expect(result).toContain(repair1);
      expect(result).toContain(repair2);
      expect(repo.findAll).toHaveBeenCalled();
    });
  });
});
