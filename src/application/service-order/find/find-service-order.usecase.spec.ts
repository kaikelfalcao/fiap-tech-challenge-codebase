import { FindServiceOrderUseCase } from './find-service-order.usecase';
import { ServiceOrderNotFound } from '@domain/service-order/service-order-not-found.error';

describe('FindServiceOrderUseCase', () => {
  let useCase: FindServiceOrderUseCase;

  const repository = {
    findById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new FindServiceOrderUseCase(repository as any);
  });

  it('should return the service order when it exists', async () => {
    const order = { id: 'order-1' };

    repository.findById.mockResolvedValue(order);

    const result = await useCase.execute({ id: 'order-1' });

    expect(repository.findById).toHaveBeenCalledWith('order-1');
    expect(result).toBe(order);
  });

  it('should throw ServiceOrderNotFound when service order does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'order-1' })).rejects.toBeInstanceOf(
      ServiceOrderNotFound,
    );
  });
});
