import { UpdateServiceOrderStatusUseCase } from './update-service-order-status.usecase';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';

describe('UpdateServiceOrderStatusUseCase', () => {
  let repository: {
    findById: jest.Mock;
    save: jest.Mock;
  };

  let approvalNotifier: {
    notify: jest.Mock;
  };

  let useCase: UpdateServiceOrderStatusUseCase;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    approvalNotifier = {
      notify: jest.fn(),
    };

    useCase = new UpdateServiceOrderStatusUseCase(
      repository as any,
      approvalNotifier as any,
    );

    jest.clearAllMocks();
  });

  it('throws error when service order is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        serviceOrderId: 'order-1',
        newStatus: ServiceOrderStatus.InProgress,
      }),
    ).rejects.toThrow('Ordem de serviço não encontrada');

    expect(repository.save).not.toHaveBeenCalled();
    expect(approvalNotifier.notify).not.toHaveBeenCalled();
  });

  it('updates status and saves order without notifying when status is not AwaitingApproval', async () => {
    const order = {
      id: 'order-1',
      status: ServiceOrderStatus.InProgress,
      changeStatus: jest.fn(function (this: any, status) {
        this.status = status;
      }),
    };

    repository.findById.mockResolvedValue(order);

    const result = await useCase.execute({
      serviceOrderId: 'order-1',
      newStatus: ServiceOrderStatus.InProgress,
    });

    expect(order.changeStatus).toHaveBeenCalledWith(
      ServiceOrderStatus.InProgress,
    );
    expect(repository.save).toHaveBeenCalledWith(order);
    expect(approvalNotifier.notify).not.toHaveBeenCalled();

    expect(result).toEqual({
      updatedOrderId: 'order-1',
      newStatus: ServiceOrderStatus.InProgress,
    });
  });

  it('notifies approval when status is AwaitingApproval', async () => {
    const order = {
      id: 'order-1',
      status: ServiceOrderStatus.InDiagnosis,
      changeStatus: jest.fn(function (this: any, status) {
        this.status = status;
      }),
    };

    repository.findById.mockResolvedValue(order);

    const result = await useCase.execute({
      serviceOrderId: 'order-1',
      newStatus: ServiceOrderStatus.AwaitingApproval,
    });

    expect(order.changeStatus).toHaveBeenCalledWith(
      ServiceOrderStatus.AwaitingApproval,
    );
    expect(repository.save).toHaveBeenCalledWith(order);
    expect(approvalNotifier.notify).toHaveBeenCalledWith(order);

    expect(result).toEqual({
      updatedOrderId: 'order-1',
      newStatus: ServiceOrderStatus.AwaitingApproval,
    });
  });
});
