import { CustomerNotFound } from '@domain/customer/errors/customer-not-found.error';
import { VehicleNotFound } from '@domain/vehicle/vehicle-not-found.error';
import { FindByCustomerAndVehicleServiceOrderUseCase } from './find-by-customer-and-vehicle-service-order.usecase';

describe('FindByCustomerAndVehicleServiceOrderUseCase', () => {
  const repo = {
    findByCustomerAndVehicle: jest.fn(),
  };

  const findCustomer = {
    execute: jest.fn(),
  };

  const findVehicle = {
    execute: jest.fn(),
  };

  const useCase = new FindByCustomerAndVehicleServiceOrderUseCase(
    repo as any,
    findCustomer as any,
    findVehicle as any,
  );

  beforeEach(() => jest.clearAllMocks());

  it('throws CustomerNotFound when customer does not exist', async () => {
    findCustomer.execute.mockResolvedValue(null);

    await expect(
      useCase.execute({ registrationNumber: '123', plate: 'ABC' }),
    ).rejects.toBeInstanceOf(CustomerNotFound);
  });

  it('throws VehicleNotFound when vehicle does not exist', async () => {
    findCustomer.execute.mockResolvedValue({ id: 'c1' });
    findVehicle.execute.mockResolvedValue(null);

    await expect(
      useCase.execute({ registrationNumber: '123', plate: 'ABC' }),
    ).rejects.toBeInstanceOf(VehicleNotFound);
  });

  it('returns service order when customer and vehicle exist', async () => {
    const order = { id: 'order-1' };

    findCustomer.execute.mockResolvedValue({ id: 'c1' });
    findVehicle.execute.mockResolvedValue({ id: 'v1' });
    repo.findByCustomerAndVehicle.mockResolvedValue(order);

    const result = await useCase.execute({
      registrationNumber: '123',
      plate: 'ABC',
    });

    expect(repo.findByCustomerAndVehicle).toHaveBeenCalledWith('c1', 'v1');
    expect(result).toBe(order);
  });
});
