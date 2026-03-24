import type { ItemRepositoryMock } from '../../../helpers/item-repository.mock';
import { makeItemRepositoryMock } from '../../../helpers/item-repository.mock';
import type { StockRepositoryMock } from '../../../helpers/stock-repository.mock';
import { makeStockRepositoryMock } from '../../../helpers/stock-repository.mock';

import { RegisterItemUseCase } from './register-item.use-case';

import { ConflictException } from '@/shared/domain/exceptions/conflict.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

const makeInput = (overrides = {}) => ({
  code: 'PART-001',
  name: 'Filtro de óleo',
  type: 'PART' as const,
  unit: 'UN',
  unitPriceCents: 5000,
  minimumStock: 5,
  ...overrides,
});

describe('RegisterItemUseCase', () => {
  let sut: RegisterItemUseCase;
  let itemRepo: ItemRepositoryMock;
  let stockRepo: StockRepositoryMock;

  beforeEach(() => {
    itemRepo = makeItemRepositoryMock();
    stockRepo = makeStockRepositoryMock();
    sut = new RegisterItemUseCase(itemRepo, stockRepo);
  });

  it('should register an item and return its id and stockId', async () => {
    itemRepo.existsByCode.mockResolvedValue(false);
    itemRepo.save.mockResolvedValue();
    stockRepo.save.mockResolvedValue();

    const output = await sut.execute(makeInput());

    expect(output.id).toBeDefined();
    expect(output.stockId).toBeDefined();
    expect(typeof output.id).toBe('string');
    expect(typeof output.stockId).toBe('string');
  });

  it('should save item with correct data', async () => {
    itemRepo.existsByCode.mockResolvedValue(false);
    itemRepo.save.mockResolvedValue();
    stockRepo.save.mockResolvedValue();

    await sut.execute(makeInput());

    const [savedItem] = itemRepo.save.mock.calls[0];
    expect(savedItem.name).toBe('Filtro de óleo');
    expect(savedItem.type).toBe('PART');
    expect(savedItem.unit).toBe('UN');
    expect(savedItem.unitPrice.cents).toBe(5000);
    expect(savedItem.active).toBe(true);
  });

  it('should create stock with zero quantity and correct minimum', async () => {
    itemRepo.existsByCode.mockResolvedValue(false);
    itemRepo.save.mockResolvedValue();
    stockRepo.save.mockResolvedValue();

    await sut.execute(makeInput({ minimumStock: 10 }));

    const [savedStock] = stockRepo.save.mock.calls[0];
    expect(savedStock.quantity).toBe(0);
    expect(savedStock.reserved).toBe(0);
    expect(savedStock.minimum).toBe(10);
  });

  it('should create stock with minimum = 0 when not provided', async () => {
    itemRepo.existsByCode.mockResolvedValue(false);
    itemRepo.save.mockResolvedValue();
    stockRepo.save.mockResolvedValue();

    await sut.execute(makeInput({ minimumStock: undefined }));

    const [savedStock] = stockRepo.save.mock.calls[0];
    expect(savedStock.minimum).toBe(0);
  });

  it('should link stock to the created item', async () => {
    itemRepo.existsByCode.mockResolvedValue(false);
    itemRepo.save.mockResolvedValue();
    stockRepo.save.mockResolvedValue();

    const output = await sut.execute(makeInput());

    const [savedStock] = stockRepo.save.mock.calls[0];
    expect(savedStock.itemId).toBe(output.id);
  });

  it('should accept SUPPLY type', async () => {
    itemRepo.existsByCode.mockResolvedValue(false);
    itemRepo.save.mockResolvedValue();
    stockRepo.save.mockResolvedValue();

    await sut.execute(makeInput({ type: 'SUPPLY', code: 'SUP-001' }));

    const [savedItem] = itemRepo.save.mock.calls[0];
    expect(savedItem.type).toBe('SUPPLY');
  });

  it('should throw ConflictException if code already exists', async () => {
    itemRepo.existsByCode.mockResolvedValue(true);

    await expect(sut.execute(makeInput())).rejects.toThrow(ConflictException);
    await expect(sut.execute(makeInput())).rejects.toThrow('PART-001');
    expect(itemRepo.save).not.toHaveBeenCalled();
    expect(stockRepo.save).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if code is invalid', async () => {
    await expect(
      sut.execute(makeInput({ code: 'invalid code!' })),
    ).rejects.toThrow(ValidationException);

    expect(itemRepo.existsByCode).not.toHaveBeenCalled();
    expect(itemRepo.save).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if unitPriceCents is negative', async () => {
    itemRepo.existsByCode.mockResolvedValue(false);

    await expect(
      sut.execute(makeInput({ unitPriceCents: -1 })),
    ).rejects.toThrow(ValidationException);

    expect(itemRepo.save).not.toHaveBeenCalled();
  });

  it('should not save stock when item save throws', async () => {
    itemRepo.existsByCode.mockResolvedValue(false);
    itemRepo.save.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(stockRepo.save).not.toHaveBeenCalled();
  });
});
