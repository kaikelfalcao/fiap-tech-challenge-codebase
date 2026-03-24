import {
  makeSORepositoryMock,
  type SORepositoryMock,
} from '../../helpers/service-order-repository.mock';
import {
  makeServiceOrder,
  makeServiceOrderWithStatus,
  makeSOService,
  makeSOItem,
  SO_UUID_1,
  CUSTOMER_UUID,
  VEHICLE_UUID,
} from '../../helpers/service-order.factory';

import { GetServiceOrderUseCase } from './get-service-order.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('GetServiceOrderUseCase', () => {
  let sut: GetServiceOrderUseCase;
  let repo: SORepositoryMock;

  beforeEach(() => {
    repo = makeSORepositoryMock();
    sut = new GetServiceOrderUseCase(repo);
  });

  it('should return the service order output', async () => {
    const order = makeServiceOrder();
    repo.findById.mockResolvedValue(order);

    const output = await sut.execute({ id: SO_UUID_1 });

    expect(output.id).toBe(order.id().value);
    expect(output.customerId).toBe(CUSTOMER_UUID);
    expect(output.vehicleId).toBe(VEHICLE_UUID);
    expect(output.status).toBe('RECEIVED');
    expect(output.statusLabel).toBe('Recebida');
  });

  it('should return correct status labels for all statuses', async () => {
    const statusLabelMap: Record<string, string> = {
      RECEIVED: 'Recebida',
      DIAGNOSIS: 'Em diagnóstico',
      AWAITING_APPROVAL: 'Aguardando aprovação',
      IN_EXECUTION: 'Em execução',
      FINALIZED: 'Finalizada',
      DELIVERED: 'Entregue',
    };

    for (const [status, label] of Object.entries(statusLabelMap)) {
      const order = makeServiceOrderWithStatus(status as any);
      repo.findById.mockResolvedValue(order);

      const output = await sut.execute({ id: SO_UUID_1 });
      expect(output.statusLabel).toBe(label);
    }
  });

  it('should return services with totalCents calculated', async () => {
    const order = makeServiceOrder({
      services: [makeSOService({ unitPriceCents: 8000, quantity: 2 })],
    });
    repo.findById.mockResolvedValue(order);

    const output = await sut.execute({ id: SO_UUID_1 });

    expect(output.services).toHaveLength(1);
    expect(output.services[0].totalCents).toBe(16000);
    expect(output.totalServicesCents).toBe(16000);
  });

  it('should return items with totalCents calculated', async () => {
    const order = makeServiceOrder({
      items: [makeSOItem({ unitPriceCents: 3500, quantity: 3 })],
    });
    repo.findById.mockResolvedValue(order);

    const output = await sut.execute({ id: SO_UUID_1 });

    expect(output.items).toHaveLength(1);
    expect(output.items[0].totalCents).toBe(10500);
    expect(output.totalItemsCents).toBe(10500);
  });

  it('should return totalCents as sum of services and items', async () => {
    const order = makeServiceOrder({
      services: [makeSOService({ unitPriceCents: 8000, quantity: 1 })],
      items: [makeSOItem({ unitPriceCents: 3500, quantity: 2 })],
    });
    repo.findById.mockResolvedValue(order);

    const output = await sut.execute({ id: SO_UUID_1 });

    expect(output.totalServicesCents).toBe(8000);
    expect(output.totalItemsCents).toBe(7000);
    expect(output.totalCents).toBe(15000);
  });

  it('should return zero totals for empty order', async () => {
    const order = makeServiceOrder();
    repo.findById.mockResolvedValue(order);

    const output = await sut.execute({ id: SO_UUID_1 });

    expect(output.totalServicesCents).toBe(0);
    expect(output.totalItemsCents).toBe(0);
    expect(output.totalCents).toBe(0);
  });

  it('should call findById with the correct ServiceOrderId', async () => {
    const order = makeServiceOrder();
    repo.findById.mockResolvedValue(order);

    await sut.execute({ id: SO_UUID_1 });

    const [calledId] = repo.findById.mock.calls[0];
    expect(calledId.value).toBe(SO_UUID_1);
  });

  it('should throw NotFoundException if order does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute({ id: SO_UUID_1 })).rejects.toThrow(
      NotFoundException,
    );
  });
});
