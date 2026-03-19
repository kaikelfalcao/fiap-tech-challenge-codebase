import {
  makeServiceRepositoryMock,
  type ServiceRepositoryMock,
} from '../../helpers/service-repository.mock';

import { RegisterServiceUseCase } from './register-service.use-case';

import { ConflictException } from '@/shared/domain/exceptions/conflict.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

const makeInput = (overrides = {}) => ({
  code: 'SVC-001',
  name: 'Troca de óleo',
  description: 'Troca de óleo e filtro',
  basePriceCents: 8000,
  estimatedDurationMinutes: 30,
  ...overrides,
});

describe('RegisterServiceUseCase', () => {
  let sut: RegisterServiceUseCase;
  let repo: ServiceRepositoryMock;

  beforeEach(() => {
    repo = makeServiceRepositoryMock();
    sut = new RegisterServiceUseCase(repo);
  });

  it('should register a service and return its id', async () => {
    repo.existsByCode.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    const output = await sut.execute(makeInput());

    expect(output.id).toBeDefined();
    expect(typeof output.id).toBe('string');
  });

  it('should save service with correct data', async () => {
    repo.existsByCode.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    await sut.execute(makeInput());

    const [saved] = repo.save.mock.calls[0];
    expect(saved.name).toBe('Troca de óleo');
    expect(saved.description).toBe('Troca de óleo e filtro');
    expect(saved.basePrice.cents).toBe(8000);
    expect(saved.estimatedDuration.minutes).toBe(30);
    expect(saved.active).toBe(true);
  });

  it('should normalize code to uppercase', async () => {
    repo.existsByCode.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    await sut.execute(makeInput({ code: 'svc-001' }));

    const [saved] = repo.save.mock.calls[0];
    expect(saved.code.value).toBe('SVC-001');
  });

  it('should throw ConflictException if code already exists', async () => {
    repo.existsByCode.mockResolvedValue(true);

    await expect(sut.execute(makeInput())).rejects.toThrow(ConflictException);
    await expect(sut.execute(makeInput())).rejects.toThrow('SVC-001');
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if code is invalid', async () => {
    await expect(
      sut.execute(makeInput({ code: 'invalid code!' })),
    ).rejects.toThrow(ValidationException);

    expect(repo.existsByCode).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if basePriceCents is negative', async () => {
    repo.existsByCode.mockResolvedValue(false);

    await expect(
      sut.execute(makeInput({ basePriceCents: -1 })),
    ).rejects.toThrow(ValidationException);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if duration is zero', async () => {
    repo.existsByCode.mockResolvedValue(false);

    await expect(
      sut.execute(makeInput({ estimatedDurationMinutes: 0 })),
    ).rejects.toThrow(ValidationException);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw ValidationException if duration is negative', async () => {
    repo.existsByCode.mockResolvedValue(false);

    await expect(
      sut.execute(makeInput({ estimatedDurationMinutes: -10 })),
    ).rejects.toThrow(ValidationException);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should allow basePriceCents = 0 (free service)', async () => {
    repo.existsByCode.mockResolvedValue(false);
    repo.save.mockResolvedValue();

    const output = await sut.execute(makeInput({ basePriceCents: 0 }));

    expect(output.id).toBeDefined();
    const [saved] = repo.save.mock.calls[0];
    expect(saved.basePrice.cents).toBe(0);
  });

  it('should not call save when existsByCode throws', async () => {
    repo.existsByCode.mockRejectedValue(new Error('Database error'));

    await expect(sut.execute(makeInput())).rejects.toThrow('Database error');
    expect(repo.save).not.toHaveBeenCalled();
  });
});
