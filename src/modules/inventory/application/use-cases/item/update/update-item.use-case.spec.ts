import type { ItemRepositoryMock } from '../../../helpers/item-repository.mock';
import { makeItemRepositoryMock } from '../../../helpers/item-repository.mock';
import { ITEM_UUID_1, makeItem } from '../../../helpers/item.factory';

import { UpdateItemUseCase } from './update-item.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

const makeInput = (overrides = {}) => ({
  id: ITEM_UUID_1,
  name: 'Filtro de ar',
  unit: 'CX',
  unitPriceCents: 8000,
  ...overrides,
});

describe('UpdateItemUseCase', () => {
  let sut: UpdateItemUseCase;
  let repo: ItemRepositoryMock;

  beforeEach(() => {
    repo = makeItemRepositoryMock();
    sut = new UpdateItemUseCase(repo);
  });

  it('should update all provided attributes', async () => {
    const item = makeItem();
    repo.findById.mockResolvedValue(item);
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    expect(item.name).toBe('Filtro de ar');
    expect(item.unit).toBe('CX');
    expect(item.unitPrice.cents).toBe(8000);
  });

  it('should call update with the modified item', async () => {
    const item = makeItem();
    repo.findById.mockResolvedValue(item);
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith(item);
  });

  it('should update only provided fields', async () => {
    const item = makeItem({ unit: 'UN' });
    const originalUnit = item.unit;
    const originalPrice = item.unitPrice.cents;
    repo.findById.mockResolvedValue(item);
    repo.update.mockResolvedValue();

    await sut.execute({ id: ITEM_UUID_1, name: 'Only Name' });

    expect(item.name).toBe('Only Name');
    expect(item.unit).toBe(originalUnit);
    expect(item.unitPrice.cents).toBe(originalPrice);
  });

  it('should throw NotFoundException if item does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if unitPriceCents is negative', async () => {
    const item = makeItem();
    repo.findById.mockResolvedValue(item);

    await expect(
      sut.execute(makeInput({ unitPriceCents: -100 })),
    ).rejects.toThrow(ValidationException);

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should call findById with the correct ItemId', async () => {
    const item = makeItem();
    repo.findById.mockResolvedValue(item);
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    const [calledId] = repo.findById.mock.calls[0];
    expect(calledId.value).toBe(ITEM_UUID_1);
  });

  it('should not call update when findById throws', async () => {
    repo.findById.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(repo.update).not.toHaveBeenCalled();
  });
});
