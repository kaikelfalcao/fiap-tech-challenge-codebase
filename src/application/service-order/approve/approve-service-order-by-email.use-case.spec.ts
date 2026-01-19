import { ApproveServiceOrderByEmailUseCase } from './approve-service-order-by-email.usecase';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';
import { UpdateServiceOrderStatusUseCase } from '../update-status/update-service-order-status.usecase';

describe('ApproveServiceOrderByEmailUseCase', () => {
  let updateStatusUseCase: jest.Mocked<UpdateServiceOrderStatusUseCase>;
  let useCase: ApproveServiceOrderByEmailUseCase;

  beforeEach(() => {
    updateStatusUseCase = {
      execute: jest.fn(),
    } as any;

    useCase = new ApproveServiceOrderByEmailUseCase(updateStatusUseCase);
  });

  it('should set status to InProgress when approved is true', async () => {
    updateStatusUseCase.execute.mockResolvedValue({
      updatedOrderId: 'order-1',
      newStatus: ServiceOrderStatus.InProgress,
    });

    await useCase.execute({
      serviceOrderId: 'order-1',
      approved: true,
    });

    expect(updateStatusUseCase.execute).toHaveBeenCalledWith({
      serviceOrderId: 'order-1',
      newStatus: ServiceOrderStatus.InProgress,
    });
  });

  it('should set status to Canceled when approved is false', async () => {
    updateStatusUseCase.execute.mockResolvedValue({
      updatedOrderId: 'order-1',
      newStatus: ServiceOrderStatus.Canceled,
    });

    await useCase.execute({
      serviceOrderId: 'order-1',
      approved: false,
    });

    expect(updateStatusUseCase.execute).toHaveBeenCalledWith({
      serviceOrderId: 'order-1',
      newStatus: ServiceOrderStatus.Canceled,
    });
  });
});
