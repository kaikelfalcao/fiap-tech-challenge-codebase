import { ServiceOrderRepository } from '@domain/repositories/service-order.repository';
import { CreateServiceOrderUseCase } from '../service-order/create-service-order.usecase';
import { ServiceOrder } from '@domain/entities/service-order.entity';
import { DeleteServiceOrderUseCase } from '../service-order/delete-service-order.usecase';
import { FindAllServiceOrderUseCase } from '../service-order/find-all-service-order.usecase';
import { FindByCustomerAndVehicleServiceOrderUseCase } from '../service-order/find-by-customer-and-vehicle-service-order.usecase';
import { CustomerNotFound } from '@domain/customer/errors/customer-not-found.error';
import { VehicleNotFound } from '@domain/errors/vehicle-not-found.error';
import { FindServiceOrderUseCase } from '../service-order/find-service-order.usecase';

const makeRepo = (): jest.Mocked<ServiceOrderRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
  findByCustomerAndVehicle: jest.fn(),
  update: jest.fn(),
});

const mockUseCase = <T = any>() => ({
  execute: jest.fn<Promise<T>, any>(),
});

/* -------------------------------------------------------------------------- */
/*                                    FIXTURES                                 */
/* -------------------------------------------------------------------------- */

const customer = { id: 'customer-1' };
const vehicle = { id: 'vehicle-1', customerId: 'customer-1' };

/* -------------------------------------------------------------------------- */
/*                            CREATE SERVICE ORDER                              */
/* -------------------------------------------------------------------------- */

describe('CreateServiceOrderUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('creates a service order without parts or repairs', async () => {
    const repo = makeRepo();

    const findCustomer = mockUseCase();
    findCustomer.execute.mockResolvedValue(customer as any);

    const findVehicle = mockUseCase();
    findVehicle.execute.mockResolvedValue(vehicle as any);

    const useCase = new CreateServiceOrderUseCase(
      findCustomer as any,
      findVehicle as any,
      mockUseCase() as any,
      mockUseCase() as any,
      repo,
    );

    const result = await useCase.execute({
      customerRegistrationNumber: '123',
      vehiclePlate: 'ABC-1234',
    });

    expect(result).toBeInstanceOf(ServiceOrder);
    expect(repo.save).toHaveBeenCalledWith(result);
  });

  it('throws when customer is not found', async () => {
    const repo = makeRepo();

    const findCustomer = mockUseCase();
    findCustomer.execute.mockResolvedValue(null);

    const useCase = new CreateServiceOrderUseCase(
      findCustomer as any,
      mockUseCase() as any,
      mockUseCase() as any,
      mockUseCase() as any,
      repo,
    );

    await expect(
      useCase.execute({
        customerRegistrationNumber: '123',
        vehiclePlate: 'ABC',
      }),
    ).rejects.toThrow('Cliente não encontrado');
  });

  it('throws when vehicle does not belong to customer', async () => {
    const repo = makeRepo();

    const findCustomer = mockUseCase();
    findCustomer.execute.mockResolvedValue(customer as any);

    const findVehicle = mockUseCase();
    findVehicle.execute.mockResolvedValue({
      id: 'vehicle-1',
      customerId: 'other-customer',
    });

    const useCase = new CreateServiceOrderUseCase(
      findCustomer as any,
      findVehicle as any,
      mockUseCase() as any,
      mockUseCase() as any,
      repo,
    );

    await expect(
      useCase.execute({
        customerRegistrationNumber: '123',
        vehiclePlate: 'ABC',
      }),
    ).rejects.toThrow('Veículo não pertence ao cliente informado');
  });

  it('reserves parts and assigns them to the order', async () => {
    const repo = makeRepo();

    const findCustomer = mockUseCase();
    findCustomer.execute.mockResolvedValue(customer as any);

    const findVehicle = mockUseCase();
    findVehicle.execute.mockResolvedValue(vehicle as any);

    const reserveParts = mockUseCase();
    reserveParts.execute.mockResolvedValue({
      processed: [{ partId: 'part-1', quantity: 2, priceAtTime: 50 }],
    });

    const useCase = new CreateServiceOrderUseCase(
      findCustomer as any,
      findVehicle as any,
      reserveParts as any,
      mockUseCase() as any,
      repo,
    );

    const order = await useCase.execute({
      customerRegistrationNumber: '123',
      vehiclePlate: 'ABC',
      parts: [{ partId: 'part-1', quantity: 2 }],
    });

    expect(order.parts).toHaveLength(1);
    expect(reserveParts.execute).toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------------------- */
/*                            DELETE SERVICE ORDER                              */
/* -------------------------------------------------------------------------- */

describe('DeleteServiceOrderUseCase', () => {
  it('deletes existing service order', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue({ id: 'order-1' } as ServiceOrder);

    const useCase = new DeleteServiceOrderUseCase(repo);
    await useCase.execute({ id: 'order-1' });

    expect(repo.delete).toHaveBeenCalledWith('order-1');
  });
});

/* -------------------------------------------------------------------------- */
/*                           FIND ALL SERVICE ORDERS                            */
/* -------------------------------------------------------------------------- */

describe('FindAllServiceOrderUseCase', () => {
  it('returns all service orders', async () => {
    const repo = makeRepo();
    const orders = [
      ServiceOrder.create('c1', 'v1'),
      ServiceOrder.create('c2', 'v2'),
    ];

    repo.findAll.mockResolvedValue(orders);

    const useCase = new FindAllServiceOrderUseCase(repo);
    expect(await useCase.execute()).toEqual(orders);
  });

  it('returns empty list when none exist', async () => {
    const repo = makeRepo();
    repo.findAll.mockResolvedValue([]);

    const useCase = new FindAllServiceOrderUseCase(repo);
    expect(await useCase.execute()).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/*                   FIND BY CUSTOMER AND VEHICLE                               */
/* -------------------------------------------------------------------------- */

describe('FindByCustomerAndVehicleServiceOrderUseCase', () => {
  it('finds service order by customer and vehicle', async () => {
    const repo = makeRepo();
    const order = ServiceOrder.create(customer.id, vehicle.id);

    repo.findByCustomerAndVehicle.mockResolvedValue(order);

    const findCustomer = mockUseCase();
    findCustomer.execute.mockResolvedValue(customer);

    const findVehicle = mockUseCase();
    findVehicle.execute.mockResolvedValue(vehicle);

    const useCase = new FindByCustomerAndVehicleServiceOrderUseCase(
      repo,
      findCustomer as any,
      findVehicle as any,
    );

    const result = await useCase.execute({
      registrationNumber: '123',
      plate: 'ABC',
    });

    expect(result).toBe(order);
  });

  it('throws CustomerNotFound', async () => {
    const findCustomer = mockUseCase();
    findCustomer.execute.mockResolvedValue(null);

    const useCase = new FindByCustomerAndVehicleServiceOrderUseCase(
      makeRepo(),
      findCustomer as any,
      mockUseCase() as any,
    );

    await expect(
      useCase.execute({ registrationNumber: '123', plate: 'ABC' }),
    ).rejects.toBeInstanceOf(CustomerNotFound);
  });

  it('throws VehicleNotFound', async () => {
    const findCustomer = mockUseCase();
    findCustomer.execute.mockResolvedValue(customer);

    const findVehicle = mockUseCase();
    findVehicle.execute.mockResolvedValue(null);

    const useCase = new FindByCustomerAndVehicleServiceOrderUseCase(
      makeRepo(),
      findCustomer as any,
      findVehicle as any,
    );

    await expect(
      useCase.execute({ registrationNumber: '123', plate: 'ABC' }),
    ).rejects.toBeInstanceOf(VehicleNotFound);
  });
});

/* -------------------------------------------------------------------------- */
/*                            FIND SERVICE ORDER                                */
/* -------------------------------------------------------------------------- */

describe('FindServiceOrderUseCase', () => {
  it('returns service order by id', async () => {
    const repo = makeRepo();
    const order = ServiceOrder.create('c1', 'v1');

    repo.findById.mockResolvedValue(order);

    const useCase = new FindServiceOrderUseCase(repo);
    expect(await useCase.execute({ id: order.id })).toBe(order);
  });
});
