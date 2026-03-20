import {
  makeCustomerApiMock,
  makeVehicleApiMock,
  makeCustomerView,
  makeVehicleView,
  type CustomerApiMock,
  type VehicleApiMock,
} from '../../helpers/external-apis.mock';
import { makeMetricsMock, type MetricsMock } from '../../helpers/metrics.mock';
import {
  makeSORepositoryMock,
  type SORepositoryMock,
} from '../../helpers/service-order-repository.mock';
import {
  CUSTOMER_UUID,
  VEHICLE_UUID,
} from '../../helpers/service-order.factory';

import { OpenServiceOrderUseCase } from './open-service-order.use-case';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

const makeInput = (overrides = {}) => ({
  customerTaxId: '52998224725',
  vehicleLicensePlate: 'ABC-1234',
  ...overrides,
});

describe('OpenServiceOrderUseCase', () => {
  let sut: OpenServiceOrderUseCase;
  let repo: SORepositoryMock;
  let customerApi: CustomerApiMock;
  let vehicleApi: VehicleApiMock;
  let metrics: MetricsMock;

  beforeEach(() => {
    repo = makeSORepositoryMock();
    customerApi = makeCustomerApiMock();
    vehicleApi = makeVehicleApiMock();
    metrics = makeMetricsMock();
    sut = new OpenServiceOrderUseCase(repo, customerApi, vehicleApi, metrics);
  });

  it('should open a service order and return its id', async () => {
    customerApi.getByTaxId.mockResolvedValue(makeCustomerView());
    vehicleApi.findByLicensePlate.mockResolvedValue(makeVehicleView());
    repo.save.mockResolvedValue();

    const output = await sut.execute(makeInput());

    expect(output.id).toBeDefined();
    expect(typeof output.id).toBe('string');
  });

  it('should save order with RECEIVED status', async () => {
    customerApi.getByTaxId.mockResolvedValue(makeCustomerView());
    vehicleApi.findByLicensePlate.mockResolvedValue(makeVehicleView());
    repo.save.mockResolvedValue();

    await sut.execute(makeInput());

    const [saved] = repo.save.mock.calls[0];
    expect(saved.status).toBe('RECEIVED');
    expect(saved.customerId).toBe(CUSTOMER_UUID);
    expect(saved.vehicleId).toBe(VEHICLE_UUID);
    expect(saved.services).toHaveLength(0);
    expect(saved.items).toHaveLength(0);
  });

  it('should record metric after saving the order', async () => {
    customerApi.getByTaxId.mockResolvedValue(makeCustomerView());
    vehicleApi.findByLicensePlate.mockResolvedValue(makeVehicleView());
    repo.save.mockResolvedValue();

    await sut.execute(makeInput());

    expect(metrics.recordServiceOrderOpened).toHaveBeenCalledTimes(1);
  });

  it('should not record metric if save throws', async () => {
    customerApi.getByTaxId.mockResolvedValue(makeCustomerView());
    vehicleApi.findByLicensePlate.mockResolvedValue(makeVehicleView());
    repo.save.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(metrics.recordServiceOrderOpened).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if customer is not found', async () => {
    customerApi.getByTaxId.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(NotFoundException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if customer is inactive', async () => {
    customerApi.getByTaxId.mockResolvedValue(
      makeCustomerView({ active: false }),
    );

    await expect(sut.execute(makeInput())).rejects.toThrow(ValidationException);
    await expect(sut.execute(makeInput())).rejects.toThrow('inactive customer');
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if vehicle is not found', async () => {
    customerApi.getByTaxId.mockResolvedValue(makeCustomerView());
    vehicleApi.findByLicensePlate.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(NotFoundException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if vehicle belongs to another customer', async () => {
    customerApi.getByTaxId.mockResolvedValue(makeCustomerView());
    vehicleApi.findByLicensePlate.mockResolvedValue(
      makeVehicleView({ customerId: 'other-customer-uuid' }),
    );

    await expect(sut.execute(makeInput())).rejects.toThrow(ValidationException);
    await expect(sut.execute(makeInput())).rejects.toThrow(
      'Vehicle does not belong to this customer',
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should not call save when customerApi throws', async () => {
    customerApi.getByTaxId.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(repo.save).not.toHaveBeenCalled();
  });
});
