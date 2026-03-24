import { Service } from '../../domain/service.entity';
import type {
  CreateServiceProps,
  ServiceProps,
} from '../../domain/service.entity';
import { Duration } from '../../domain/value-objects/duration.vo';
import { ServiceCode } from '../../domain/value-objects/service-code.vo';
import { ServiceId } from '../../domain/value-objects/service-id.vo';

import { Money } from '@/shared/domain/value-objects/money.vo';

export const SERVICE_UUID_1 = 'f1a2b3c4-0001-4000-8000-000000000001';
export const SERVICE_UUID_2 = 'f1a2b3c4-0002-4000-8000-000000000002';
export const SERVICE_UUID_3 = 'f1a2b3c4-0003-4000-8000-000000000003';

export const makeServiceId = (value = SERVICE_UUID_1): ServiceId =>
  ServiceId.fromString(value);

export const makeServiceCode = (value = 'SVC-001'): ServiceCode =>
  ServiceCode.create(value);

export const makeCreateProps = (
  overrides: Partial<CreateServiceProps> = {},
): CreateServiceProps => ({
  id: makeServiceId(),
  code: makeServiceCode(),
  name: 'Troca de óleo',
  description: 'Troca de óleo e filtro de óleo',
  basePrice: Money.fromCents(8000),
  estimatedDuration: Duration.create(30),
  ...overrides,
});

export const makeRestoreProps = (
  overrides: Partial<ServiceProps> = {},
): ServiceProps => ({
  id: makeServiceId(),
  code: makeServiceCode(),
  name: 'Troca de óleo',
  description: 'Troca de óleo e filtro de óleo',
  basePrice: Money.fromCents(8000),
  estimatedDuration: Duration.create(30),
  active: true,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

export const makeService = (overrides: Partial<ServiceProps> = {}): Service =>
  Service.restore(makeRestoreProps(overrides));
