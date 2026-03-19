import {
  makeCatalogApiMock,
  makeCatalogServiceView,
  type CatalogApiMock,
} from '../../helpers/external-apis.mock';
import {
  makeSORepositoryMock,
  type SORepositoryMock,
} from '../../helpers/service-order-repository.mock';
import {
  makeServiceOrder,
  makeServiceOrderWithStatus,
  SO_UUID_1,
  SERVICE_UUID_1,
} from '../../helpers/service-order.factory';

import { AddServiceToOrderUseCase } from './add-service-to-order.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

const makeInput = (overrides = {}) => ({
  orderId: SO_UUID_1,
  serviceId: SERVICE_UUID_1,
  quantity: 1,
  ...overrides,
});

describe('AddServiceToOrderUseCase', () => {
  let sut: AddServiceToOrderUseCase;
  let repo: SORepositoryMock;
  let catalogApi: CatalogApiMock;

  beforeEach(() => {
    repo = makeSORepositoryMock();
    catalogApi = makeCatalogApiMock();
    sut = new AddServiceToOrderUseCase(repo, catalogApi);
  });

  it('should add a service to the order', async () => {
    const order = makeServiceOrder();
    repo.findById.mockResolvedValue(order);
    catalogApi.getServiceById.mockResolvedValue(makeCatalogServiceView());
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    expect(order.services).toHaveLength(1);
    expect(order.services[0].serviceId).toBe(SERVICE_UUID_1);
    expect(order.services[0].unitPriceCents).toBe(8000);
  });

  it('should snapshot service price at time of addition', async () => {
    const order = makeServiceOrder();
    repo.findById.mockResolvedValue(order);
    catalogApi.getServiceById.mockResolvedValue(
      makeCatalogServiceView({ basePriceCents: 12000 }),
    );
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    expect(order.services[0].unitPriceCents).toBe(12000);
  });

  it('should call update with the modified order', async () => {
    const order = makeServiceOrder();
    repo.findById.mockResolvedValue(order);
    catalogApi.getServiceById.mockResolvedValue(makeCatalogServiceView());
    repo.update.mockResolvedValue();

    await sut.execute(makeInput());

    expect(repo.update).toHaveBeenCalledWith(order);
  });

  it('should throw NotFoundException if order does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if service does not exist', async () => {
    repo.findById.mockResolvedValue(makeServiceOrder());
    catalogApi.getServiceById.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if service is inactive', async () => {
    repo.findById.mockResolvedValue(makeServiceOrder());
    catalogApi.getServiceById.mockResolvedValue(
      makeCatalogServiceView({ active: false }),
    );

    await expect(sut.execute(makeInput())).rejects.toThrow(ValidationException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if service already in order', async () => {
    const order = makeServiceOrder({
      services: [
        {
          serviceId: SERVICE_UUID_1,
          name: 'Troca de óleo',
          unitPriceCents: 8000,
          quantity: 1,
        } as any,
      ],
    });
    repo.findById.mockResolvedValue(order);
    catalogApi.getServiceById.mockResolvedValue(makeCatalogServiceView());

    await expect(sut.execute(makeInput())).rejects.toThrow(ValidationException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if order is not editable', async () => {
    repo.findById.mockResolvedValue(makeServiceOrderWithStatus('IN_EXECUTION'));
    catalogApi.getServiceById.mockResolvedValue(makeCatalogServiceView());

    await expect(sut.execute(makeInput())).rejects.toThrow(ValidationException);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
