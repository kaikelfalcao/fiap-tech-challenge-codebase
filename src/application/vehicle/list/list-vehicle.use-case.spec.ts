import { Vehicle } from '@domain/vehicle/vehicle.entity';
import { ListVehicleUseCase } from './list-vehicle.usecase';

describe('ListVehicleUseCase', () => {
  let mockRepo: any;
  let useCase: ListVehicleUseCase;

  beforeEach(() => {
    mockRepo = {
      count: jest.fn(),
      findAll: jest.fn(),
    };

    useCase = new ListVehicleUseCase(mockRepo);
  });

  it('should list vehicles with default pagination', async () => {
    const vehicles = [
      Vehicle.create('Toyota', 'Corolla', 2022, 'ABC1234', '1'),
      Vehicle.create('Honda', 'Civic', 2021, 'DEF5678', '2'),
    ];

    mockRepo.count.mockResolvedValue(2);
    mockRepo.findAll.mockResolvedValue(vehicles);

    const result = await useCase.execute();

    expect(result.data).toEqual(vehicles);
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    expect(mockRepo.count).toHaveBeenCalled();
    expect(mockRepo.findAll).toHaveBeenCalledWith({
      skip: 0,
      take: 20,
    });
  });

  it('should list vehicles with provided pagination params', async () => {
    const vehicles = [
      Vehicle.create('Toyota', 'Corolla', 2022, 'ABC1234', '1'),
    ];

    mockRepo.count.mockResolvedValue(10);
    mockRepo.findAll.mockResolvedValue(vehicles);

    const result = await useCase.execute({
      page: 2,
      pageSize: 5,
    });

    expect(result.data).toEqual(vehicles);
    expect(result.meta).toEqual({
      total: 10,
      page: 2,
      pageSize: 5,
      totalPages: 2,
    });

    expect(mockRepo.findAll).toHaveBeenCalledWith({
      skip: 5,
      take: 5,
    });
  });

  it('should normalize invalid pagination params', async () => {
    mockRepo.count.mockResolvedValue(0);
    mockRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute({
      page: 0,
      pageSize: -10,
    });

    expect(result.meta.page).toBe(1);
    expect(result.meta.pageSize).toBe(1);
    expect(result.meta.totalPages).toBe(0);

    expect(mockRepo.findAll).toHaveBeenCalledWith({
      skip: 0,
      take: 1,
    });
  });
});
