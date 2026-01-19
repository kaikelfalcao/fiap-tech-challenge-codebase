import { UpdateServiceOrderUseCase } from './update-service-order.usecase';

describe('UpdateServiceOrderUseCase', () => {
  let useCase: UpdateServiceOrderUseCase;

  const repository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const reservePart = { execute: jest.fn() };
  const returnPart = { execute: jest.fn() };
  const findPart = { execute: jest.fn() };
  const findRepair = { execute: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new UpdateServiceOrderUseCase(
      repository as any,
      reservePart as any,
      returnPart as any,
      findPart as any,
      findRepair as any,
    );
  });

  it('removes parts and returns them to stock', async () => {
    const order = {
      id: 'order-1',
      parts: [{ partId: 'p1', quantity: 2 }],
      repairs: [],
      assignPart: jest.fn(),
      assignRepair: jest.fn(),
    };

    repository.findById.mockResolvedValue(order);

    const result = await useCase.execute({
      serviceOrderId: 'order-1',
      parts: [],
    });

    expect(returnPart.execute).toHaveBeenCalledWith([
      { partId: 'p1', quantity: 2 },
    ]);

    expect(repository.save).toHaveBeenCalledWith(order);
    expect(result.removedParts).toEqual([{ partId: 'p1', quantity: 2 }]);
  });
});
