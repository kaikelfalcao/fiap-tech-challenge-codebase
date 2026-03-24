import type { ItemRepositoryMock } from '../../../helpers/item-repository.mock';
import { makeItemRepositoryMock } from '../../../helpers/item-repository.mock';
import { ITEM_UUID_1, makeItem } from '../../../helpers/item.factory';

import { ActivateItemUseCase } from './activate-item.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('ActivateItemUseCase', () => {
  let sut: ActivateItemUseCase;
  let repo: ItemRepositoryMock;

  beforeEach(() => {
    repo = makeItemRepositoryMock();
    sut = new ActivateItemUseCase(repo);
  });

  it('should activate an inactive item', async () => {
    const item = makeItem({ active: false });
    repo.findById.mockResolvedValue(item);
    repo.update.mockResolvedValue();

    await sut.execute({ id: ITEM_UUID_1 });

    expect(item.active).toBe(true);
  });

  it('should call update with the activated item', async () => {
    const item = makeItem({ active: false });
    repo.findById.mockResolvedValue(item);
    repo.update.mockResolvedValue();

    await sut.execute({ id: ITEM_UUID_1 });

    expect(repo.update).toHaveBeenCalledWith(item);
  });

  it('should still call update even if already active', async () => {
    const item = makeItem({ active: true });
    repo.findById.mockResolvedValue(item);
    repo.update.mockResolvedValue();

    await sut.execute({ id: ITEM_UUID_1 });

    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException if item does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute({ id: ITEM_UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should not call update when findById throws', async () => {
    repo.findById.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({ id: ITEM_UUID_1 })).rejects.toThrow(
      'Database error',
    );
    expect(repo.update).not.toHaveBeenCalled();
  });
});
