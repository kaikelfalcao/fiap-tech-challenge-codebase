import { DeleteServiceOrderUseCase } from './delete-service-order.usecase';

describe('DeleteServiceOrderUseCase', () => {
  let useCase: DeleteServiceOrderUseCase;

  const repository = {
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new DeleteServiceOrderUseCase(repository as any);
  });

  it('should delete service order when it exists', async () => {
    repository.findById.mockResolvedValue({ id: 'order-1' });

    await useCase.execute({ id: 'order-1' });

    expect(repository.findById).toHaveBeenCalledWith('order-1');
    expect(repository.delete).toHaveBeenCalledWith('order-1');
  });

  it('should throw an error when service order does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'order-1' })).rejects.toThrow(
      'Order not found',
    );

    expect(repository.delete).not.toHaveBeenCalled();
  });
});
