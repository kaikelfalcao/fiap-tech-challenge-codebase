import {
  makeInventoryApiMock,
  makeInventoryItemView,
  type InventoryApiMock,
} from '../../helpers/external-apis.mock';
import {
  makeSORepositoryMock,
  type SORepositoryMock,
} from '../../helpers/service-order-repository.mock';
import {
  makeServiceOrder,
  makeServiceOrderWithStatus,
  SO_UUID_1,
  ITEM_UUID_1,
} from '../../helpers/service-order.factory';

import { AddItemToOrderUseCase } from './add-item-to-order.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

const makeInput = (overrides = {}) => ({
  orderId: SO_UUID_1,
  itemId: ITEM_UUID_1,
  quantity: 2,
  ...overrides,
});

describe('AddItemToOrderUseCase', () => {
  let sut: AddItemToOrderUseCase;
  let repo: SORepositoryMock;
  let inventoryApi: InventoryApiMock;

  beforeEach(() => {
    repo = makeSORepositoryMock();
    inventoryApi = makeInventoryApiMock();
    sut = new AddItemToOrderUseCase(repo, inventoryApi);
  });

  it('should add an item to the order', async () => {
    repo.findById.mockResolvedValue(makeServiceOrder());
    inventoryApi.getItemById.mockResolvedValue(makeInventoryItemView());
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    const [updated] = repo.update.mock.calls[0];
    expect(updated.items).toHaveLength(1);
    expect(updated.items[0].itemId).toBe(ITEM_UUID_1);
    expect(updated.items[0].quantity).toBe(2);
  });

  it('should snapshot item price at time of addition', async () => {
    repo.findById.mockResolvedValue(makeServiceOrder());
    inventoryApi.getItemById.mockResolvedValue(
      makeInventoryItemView({ unitPriceCents: 5000 }),
    );
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    const [updated] = repo.update.mock.calls[0];
    expect(updated.items[0].unitPriceCents).toBe(5000);
  });

  it('should throw NotFoundException if order does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if item does not exist', async () => {
    repo.findById.mockResolvedValue(makeServiceOrder());
    inventoryApi.getItemById.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException when requested quantity exceeds available stock', async () => {
    repo.findById.mockResolvedValue(makeServiceOrder());
    inventoryApi.getItemById.mockResolvedValue(
      makeInventoryItemView({
        stock: { quantity: 5, reserved: 4, available: 1 },
      }),
    );

    await expect(sut.execute(makeInput({ quantity: 5 }))).rejects.toThrow(
      ValidationException,
    );
    await expect(sut.execute(makeInput({ quantity: 5 }))).rejects.toThrow(
      'Insufficient stock',
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should allow adding item when quantity equals available stock', async () => {
    repo.findById.mockResolvedValue(makeServiceOrder());
    inventoryApi.getItemById.mockResolvedValue(
      makeInventoryItemView({
        stock: { quantity: 10, reserved: 5, available: 5 },
      }),
    );
    repo.update.mockResolvedValue();

    await sut.execute(makeInput({ quantity: 5 }));

    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('should throw ValidationException if item already in order', async () => {
    const order = makeServiceOrder({
      items: [
        {
          itemId: ITEM_UUID_1,
          name: 'Filtro',
          unitPriceCents: 3500,
          quantity: 1,
        } as any,
      ],
    });
    repo.findById.mockResolvedValue(order);
    inventoryApi.getItemById.mockResolvedValue(makeInventoryItemView());

    await expect(sut.execute(makeInput())).rejects.toThrow(ValidationException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if order is not editable', async () => {
    repo.findById.mockResolvedValue(
      makeServiceOrderWithStatus('AWAITING_APPROVAL'),
    );
    inventoryApi.getItemById.mockResolvedValue(makeInventoryItemView());

    await expect(sut.execute(makeInput())).rejects.toThrow(ValidationException);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
