import {
  makeCustomerApiMock,
  makeCustomerView,
  type CustomerApiMock,
} from '../../helpers/customer-api.mock';
import {
  makeVehicleRepositoryMock,
  type VehicleRepositoryMock,
} from '../../helpers/vehicle-repository.mock';
import {
  VALID_CUSTOMER_ID,
  VALID_PLATE_OLD,
  VALID_PLATE_MERCOSUL,
} from '../../helpers/vehicle.factory';

import { RegisterVehicleUseCase } from './register-vehicle.use-case';

import { ConflictException } from '@/shared/domain/exceptions/conflict.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

const makeInput = (overrides = {}) => ({
  customerId: VALID_CUSTOMER_ID,
  licensePlate: VALID_PLATE_OLD,
  brand: 'Toyota',
  model: 'Corolla',
  year: 2022,
  ...overrides,
});

describe('RegisterVehicleUseCase', () => {
  let sut: RegisterVehicleUseCase;
  let repo: VehicleRepositoryMock;
  let customerApi: CustomerApiMock;

  beforeEach(() => {
    repo = makeVehicleRepositoryMock();
    customerApi = makeCustomerApiMock();
    sut = new RegisterVehicleUseCase(repo, customerApi);
  });

  it('should register a vehicle and return its id', async () => {
    customerApi.getById.mockResolvedValue(makeCustomerView());
    repo.existsByLicensePlate.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    const output = await sut.execute(makeInput());

    expect(output.id).toBeDefined();
    expect(typeof output.id).toBe('string');
  });

  it('should save vehicle with the provided data', async () => {
    customerApi.getById.mockResolvedValue(makeCustomerView());
    repo.existsByLicensePlate.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    await sut.execute(makeInput());

    const [saved] = repo.save.mock.calls[0];
    expect(saved.brand).toBe('Toyota');
    expect(saved.model).toBe('Corolla');
    expect(saved.year).toBe(2022);
    expect(saved.customerId).toBe(VALID_CUSTOMER_ID);
  });

  it('should normalize and store the license plate', async () => {
    customerApi.getById.mockResolvedValue(makeCustomerView());
    repo.existsByLicensePlate.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    await sut.execute(makeInput({ licensePlate: 'ABC-1234' }));

    const [saved] = repo.save.mock.calls[0];
    expect(saved.licensePlate.raw).toBe('ABC1234');
  });

  it('should accept Mercosul plate', async () => {
    customerApi.getById.mockResolvedValue(makeCustomerView());
    repo.existsByLicensePlate.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    const output = await sut.execute(
      makeInput({ licensePlate: VALID_PLATE_MERCOSUL }),
    );

    expect(output.id).toBeDefined();
    const [saved] = repo.save.mock.calls[0];
    expect(saved.licensePlate.type).toBe('mercosul');
  });

  it('should throw NotFoundException if customer does not exist', async () => {
    customerApi.getById.mockResolvedValue(null);

    await expect(sut.execute(makeInput())).rejects.toThrow(NotFoundException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if customer is inactive', async () => {
    customerApi.getById.mockResolvedValue(makeCustomerView({ active: false }));

    await expect(sut.execute(makeInput())).rejects.toThrow(ValidationException);
    await expect(sut.execute(makeInput())).rejects.toThrow(
      'Cannot register a vehicle for an inactive customer',
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if license plate is invalid', async () => {
    customerApi.getById.mockResolvedValue(makeCustomerView());

    await expect(
      sut.execute(makeInput({ licensePlate: 'INVALID' })),
    ).rejects.toThrow(ValidationException);

    expect(repo.existsByLicensePlate).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw ConflictException if license plate already exists', async () => {
    customerApi.getById.mockResolvedValue(makeCustomerView());
    repo.existsByLicensePlate.mockResolvedValue(true);

    await expect(sut.execute(makeInput())).rejects.toThrow(ConflictException);
    await expect(sut.execute(makeInput())).rejects.toThrow(
      'A vehicle with this license plate already exists',
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should not call save when customerApi throws', async () => {
    customerApi.getById.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should not call save when existsByLicensePlate throws', async () => {
    customerApi.getById.mockResolvedValue(makeCustomerView());
    repo.existsByLicensePlate.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(repo.save).not.toHaveBeenCalled();
  });
});
