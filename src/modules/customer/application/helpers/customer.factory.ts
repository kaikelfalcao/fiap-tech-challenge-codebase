import { CustomerId } from '../../domain/customer-id.vo';
import type {
  CreateCustomerProps,
  CustomerProps,
} from '../../domain/customer.entity';
import { Customer } from '../../domain/customer.entity';
import { TaxId } from '../../domain/tax-id.vo';

import { Email } from '@/shared/domain/value-objects/email.vo';

export const VALID_CPF = '52998224725';
export const VALID_CNPJ = '11222333000181';

export const UUID_1 = '3d0a6b9e-1234-4c2a-9f1b-abc123def456';
export const UUID_2 = '7f4e2d1c-5678-4b3a-8e2c-def456abc789';
export const UUID_CNPJ = 'a1b2c3d4-9abc-4def-8012-123456789abc';

export const makeCustomerId = (value = UUID_1): CustomerId =>
  CustomerId.fromString(value);

export const makeTaxId = (value = VALID_CPF): TaxId => TaxId.create(value);

export const makeEmail = (value = 'john@doe.com'): Email => new Email(value);

export const makeCreateProps = (
  overrides: Partial<CreateCustomerProps> = {},
): CreateCustomerProps => ({
  id: makeCustomerId(),
  taxId: makeTaxId(),
  fullName: 'John Doe',
  phone: '(71) 99999-0000',
  email: makeEmail(),
  ...overrides,
});

export const makeRestoreProps = (
  overrides: Partial<CustomerProps> = {},
): CustomerProps => ({
  id: makeCustomerId(),
  taxId: makeTaxId(),
  fullName: 'John Doe',
  phone: '(71) 99999-0000',
  email: makeEmail(),
  active: true,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

export const makeCustomer = (
  overrides: Partial<CustomerProps> = {},
): Customer => Customer.restore(makeRestoreProps(overrides));
