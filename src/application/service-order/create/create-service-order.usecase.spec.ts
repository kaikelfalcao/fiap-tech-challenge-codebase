import { CreateServiceOrderUseCase } from './create-service-order.usecase';
import { ServiceOrder } from '@domain/service-order/service-order.entity';

describe('CreateServiceOrderUseCase', () => {
  let useCase: CreateServiceOrderUseCase;

  const findCustomerUseCase = {
    execute: jest.fn(),
  };

  const findVehicleUseCase = {
    execute: jest.fn(),
  };

  const reservePartUseCase = {
    execute: jest.fn(),
  };

  const calculateRepairCostsUseCase = {
    execute: jest.fn(),
  };

  const repository = {
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new CreateServiceOrderUseCase(
      findCustomerUseCase as any,
      findVehicleUseCase as any,
      reservePartUseCase as any,
      calculateRepairCostsUseCase as any,
      repository as any,
    );
  });

  it('should create a service order with parts and repairs', async () => {
    findCustomerUseCase.execute.mockResolvedValue({ id: 'customer-1' });

    findVehicleUseCase.execute.mockResolvedValue({
      id: 'vehicle-1',
      customerId: 'customer-1',
    });

    reservePartUseCase.execute.mockResolvedValue({
      processed: [{ partId: 'part-1', quantity: 2, priceAtTime: 100 }],
    });

    calculateRepairCostsUseCase.execute.mockResolvedValue({
      processed: [{ repairId: 'repair-1', costAtTime: 300 }],
    });

    const order = await useCase.execute({
      customerRegistrationNumber: '123',
      vehiclePlate: 'ABC-1234',
      parts: [{ partId: 'part-1', quantity: 2 }],
      repairs: [{ repairId: 'repair-1' }],
    });

    expect(order).toBeInstanceOf(ServiceOrder);

    expect(repository.save).toHaveBeenCalledWith(order);

    expect(reservePartUseCase.execute).toHaveBeenCalledWith([
      { partId: 'part-1', quantity: 2 },
    ]);

    expect(calculateRepairCostsUseCase.execute).toHaveBeenCalledWith([
      { repairId: 'repair-1' },
    ]);
  });

  it('should throw if customer is not found', async () => {
    findCustomerUseCase.execute.mockResolvedValue(null);

    await expect(
      useCase.execute({
        customerRegistrationNumber: '123',
        vehiclePlate: 'ABC-1234',
      }),
    ).rejects.toThrow('Cliente não encontrado');
  });

  it('should throw if vehicle does not belong to customer', async () => {
    findCustomerUseCase.execute.mockResolvedValue({ id: 'customer-1' });

    findVehicleUseCase.execute.mockResolvedValue({
      id: 'vehicle-1',
      customerId: 'customer-2',
    });

    await expect(
      useCase.execute({
        customerRegistrationNumber: '123',
        vehiclePlate: 'ABC-1234',
      }),
    ).rejects.toThrow('Veículo não pertence ao cliente informado');
  });
});
