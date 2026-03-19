import {
  makeSORepositoryMock,
  type SORepositoryMock,
} from '../../helpers/service-order-repository.mock';
import {
  makeServiceOrder,
  makeServiceOrderWithStatus,
  SO_UUID_1,
} from '../../helpers/service-order.factory';

import { StartDiagnosisUseCase } from './start-diagnosis.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('StartDiagnosisUseCase', () => {
  let sut: StartDiagnosisUseCase;
  let repo: SORepositoryMock;

  beforeEach(() => {
    repo = makeSORepositoryMock();
    sut = new StartDiagnosisUseCase(repo);
  });

  it('should transition order from RECEIVED to DIAGNOSIS', async () => {
    const order = makeServiceOrder({ status: 'RECEIVED' });
    repo.findById.mockResolvedValue(order);
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1 });

    expect(order.status).toBe('DIAGNOSIS');
  });

  it('should call update with the transitioned order', async () => {
    const order = makeServiceOrder({ status: 'RECEIVED' });
    repo.findById.mockResolvedValue(order);
    repo.update.mockResolvedValue();

    await sut.execute({ orderId: SO_UUID_1 });

    expect(repo.update).toHaveBeenCalledWith(order);
  });

  it('should throw NotFoundException if order does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute({ orderId: SO_UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw BusinessRuleException if order is not RECEIVED', async () => {
    repo.findById.mockResolvedValue(makeServiceOrderWithStatus('DIAGNOSIS'));

    await expect(sut.execute({ orderId: SO_UUID_1 })).rejects.toThrow(
      BusinessRuleException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });
});
