import { LicensePlate } from '../../../domain/value-objects/license-plate.vo';
import type { Vehicle } from '../../../domain/vehicle.entity';
import type { PaginatedResult } from '../../../domain/vehicle.repository';
import {
  makeVehicleRepositoryMock,
  type VehicleRepositoryMock,
} from '../../helpers/vehicle-repository.mock';
import {
  makeVehicle,
  makeVehicleId,
  VEHICLE_UUID_2,
  VEHICLE_UUID_3,
  VALID_PLATE_MERCOSUL,
  VALID_CUSTOMER_ID,
} from '../../helpers/vehicle.factory';

import { ListVehiclesUseCase } from './list-vehicles.use-case';

const makePaginatedResult = (
  data: Vehicle[],
  overrides: Partial<PaginatedResult<Vehicle>> = {},
): PaginatedResult<Vehicle> => ({
  data,
  total: data.length,
  page: 1,
  limit: 20,
  ...overrides,
});

describe('ListVehiclesUseCase', () => {
  let sut: ListVehiclesUseCase;
  let repo: VehicleRepositoryMock;

  beforeEach(() => {
    repo = makeVehicleRepositoryMock();
    sut = new ListVehiclesUseCase(repo);
  });

  it('should return a paginated list of vehicles', async () => {
    const vehicles = [
      makeVehicle(),
      makeVehicle({ id: makeVehicleId(VEHICLE_UUID_2) }),
    ];
    repo.list.mockResolvedValue(makePaginatedResult(vehicles));

    const output = await sut.execute({});

    expect(output.data).toHaveLength(2);
    expect(output.total).toBe(2);
    expect(output.page).toBe(1);
    expect(output.limit).toBe(20);
  });

  it('should map each vehicle to the output shape', async () => {
    const vehicle = makeVehicle();
    repo.list.mockResolvedValue(makePaginatedResult([vehicle]));

    const output = await sut.execute({});
    const item = output.data[0];

    expect(item.id).toBe(vehicle.id().value);
    expect(item.customerId).toBe(vehicle.customerId);
    expect(item.brand).toBe(vehicle.brand);
    expect(item.model).toBe(vehicle.model);
    expect(item.year).toBe(vehicle.year);
    expect(item.createdAt).toBe(vehicle.createdAt);
    expect(item.updatedAt).toBe(vehicle.updatedAt);
  });

  it('should return old plate formatted with dash', async () => {
    const vehicle = makeVehicle();
    repo.list.mockResolvedValue(makePaginatedResult([vehicle]));

    const output = await sut.execute({});

    expect(output.data[0].licensePlate).toBe('ABC-1234');
    expect(output.data[0].licensePlateType).toBe('old');
  });

  it('should return Mercosul plate without dash', async () => {
    const vehicle = makeVehicle({
      id: makeVehicleId(VEHICLE_UUID_2),
      licensePlate: LicensePlate.create(VALID_PLATE_MERCOSUL),
    });
    repo.list.mockResolvedValue(makePaginatedResult([vehicle]));

    const output = await sut.execute({});

    expect(output.data[0].licensePlate).toBe('ABC1D23');
    expect(output.data[0].licensePlateType).toBe('mercosul');
  });

  it('should forward filters to the repository', async () => {
    repo.list.mockResolvedValue(makePaginatedResult([]));

    await sut.execute({ customerId: VALID_CUSTOMER_ID, page: 2, limit: 10 });

    expect(repo.list).toHaveBeenCalledWith({
      customerId: VALID_CUSTOMER_ID,
      page: 2,
      limit: 10,
    });
  });

  it('should return an empty list when no vehicles exist', async () => {
    repo.list.mockResolvedValue(makePaginatedResult([], { total: 0 }));

    const output = await sut.execute({});

    expect(output.data).toHaveLength(0);
    expect(output.total).toBe(0);
  });

  it('should preserve pagination metadata from repository', async () => {
    repo.list.mockResolvedValue(
      makePaginatedResult([makeVehicle()], { total: 50, page: 3, limit: 10 }),
    );

    const output = await sut.execute({ page: 3, limit: 10 });

    expect(output.total).toBe(50);
    expect(output.page).toBe(3);
    expect(output.limit).toBe(10);
  });

  it('should filter correctly by customerId', async () => {
    const v1 = makeVehicle();
    const v2 = makeVehicle({ id: makeVehicleId(VEHICLE_UUID_2) });
    const v3 = makeVehicle({ id: makeVehicleId(VEHICLE_UUID_3) });
    repo.list.mockResolvedValue(
      makePaginatedResult([v1, v2, v3], { total: 3 }),
    );

    const output = await sut.execute({ customerId: VALID_CUSTOMER_ID });

    expect(repo.list).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: VALID_CUSTOMER_ID }),
    );
    expect(output.data).toHaveLength(3);
  });

  it('should throw if repository throws', async () => {
    repo.list.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute({})).rejects.toThrow('Database error');
  });
});
