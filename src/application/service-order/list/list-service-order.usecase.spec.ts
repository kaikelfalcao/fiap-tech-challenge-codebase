import { ListServiceOrderUseCase } from './list-service-order.usecase';

describe('ListServiceOrderUseCase', () => {
  it('returns all service orders', async () => {
    const orders = [{ id: '1' }, { id: '2' }];

    const repo = {
      findAll: jest.fn().mockResolvedValue(orders),
    };

    const useCase = new ListServiceOrderUseCase(repo as any);

    const result = await useCase.execute();

    expect(repo.findAll).toHaveBeenCalled();
    expect(result).toBe(orders);
  });
});
